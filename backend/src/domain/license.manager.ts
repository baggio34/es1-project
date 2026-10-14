import { type Result, Err, Ok } from "@/lib/result.ts";
import { slugify } from "@/lib/string.utils.ts";
import { loadObjectFromFile, saveObjectToFile } from "@/services/database/file_operations.ts";
import { userManager } from "./user.manager.ts";
import { vehicleManager } from "./vehicle.manager.ts";
import { orderManager } from "./order.manager.ts";

export type License = {
  name: string,
  slug: string,
}

class LicenseManager {
  licenses = new Map<string, string>()

  constructor() {
    const result = loadObjectFromFile<Record<string, string>>('./data/licenses.json')
    if (result.isOk) {
      this.licenses = new Map(Object.entries(result.ok))
      this.sanitizeOrphanedLicenses()
    } else {
      console.error(`Error loading licenses: '${result.err}'\nStarting with new data.`)
    }
  }

  public sanitizeOrphanedLicenses(): void {
    const validNames = new Set(this.licenses.values())
    const validSlugs = new Set(this.licenses.keys())
    const isValid = (l: string) => validNames.has(l) || validSlugs.has(l)

    try {
      let changed = false
      for (const u of userManager.getAll()) {
        if ('licenses' in u && Array.isArray(u.licenses)) {
          const originalLen = u.licenses.length
          u.licenses = u.licenses.filter(isValid)
          if (u.licenses.length !== originalLen) changed = true
        }
      }
      if (changed) userManager.saveUsers()
    } catch (_) {}

    try {
      let changed = false
      for (const v of vehicleManager.getAll()) {
        if (Array.isArray(v.licenses)) {
          const originalLen = v.licenses.length
          v.licenses = v.licenses.filter(isValid)
          if (v.licenses.length !== originalLen) changed = true
        }
      }
      if (changed) vehicleManager.saveVehicles()
    } catch (_) {}

    try {
      let changed = false
      for (const o of orderManager.getAll()) {
        if (Array.isArray(o.licenses)) {
          const originalLen = o.licenses.length
          o.licenses = o.licenses.filter(isValid)
          if (o.licenses.length !== originalLen) changed = true
        }
      }
      if (changed) orderManager.saveOrders()
    } catch (_) {}
  }

  saveLicenses(): Result<'saved', string> {
    // CORREÇÃO: Usar Object.fromEntries para converter o Map num objeto JSON válido
    const result = saveObjectToFile('./data/licenses.json', Object.fromEntries(this.licenses.entries()))
    if (result.isErr) {
      console.error(result.err)
      return result
    }
    return Ok('saved')
  }

  public getAll(): License[] {
    return this.licenses.entries().map(([slug, name]) => ({ slug, name }) ).toArray()
  }

  public add(name: string): Result<string, 'alreadyExists'> {
    const slug = slugify(name)
    if (this.licenses.has(slug)) return Err('alreadyExists')
    this.licenses.set(slug, name)
    this.saveLicenses()
    return Ok(slug)
  }

  public update(oldSlug: string, newName: string): Result<'updated', 'noSuchLicense' | 'alreadyExists'> {
    if (!this.licenses.has(oldSlug)) return Err('noSuchLicense')
    const oldName = this.licenses.get(oldSlug)!
    const newSlug = slugify(newName)
    if (newSlug !== oldSlug && this.licenses.has(newSlug)) {
      return Err('alreadyExists')
    }

    this.licenses.delete(oldSlug)
    this.licenses.set(newSlug, newName)
    this.saveLicenses()

    // Propaga renomeação para usuários, veículos e pedidos se estiverem em uso
    try {
      for (const u of userManager.getAll()) {
        if ('licenses' in u && Array.isArray(u.licenses) && (u.licenses.includes(oldName) || u.licenses.includes(oldSlug))) {
          u.licenses = u.licenses.map((l: string) => (l === oldName || l === oldSlug) ? newName : l)
        }
      }
      userManager.saveUsers()
    } catch (_) {}

    try {
      for (const v of vehicleManager.getAll()) {
        if (Array.isArray(v.licenses) && (v.licenses.includes(oldName) || v.licenses.includes(oldSlug))) {
          v.licenses = v.licenses.map((l: string) => (l === oldName || l === oldSlug) ? newName : l)
        }
      }
      vehicleManager.saveVehicles()
    } catch (_) {}

    try {
      for (const o of orderManager.getAll()) {
        if (Array.isArray(o.licenses) && (o.licenses.includes(oldName) || o.licenses.includes(oldSlug))) {
          o.licenses = o.licenses.map((l: string) => (l === oldName || l === oldSlug) ? newName : l)
        }
      }
      orderManager.saveOrders()
    } catch (_) {}

    return Ok('updated')
  }

  public delete(slug: string): Result<'deleted', 'noSuchLicense'> {
    if (!this.licenses.has(slug)) return Err('noSuchLicense')
    const licenseName = this.licenses.get(slug)!
    this.licenses.delete(slug)
    this.saveLicenses()

    // Remove a licença excluída de todos os motoristas, veículos e pedidos
    try {
      for (const u of userManager.getAll()) {
        if ('licenses' in u && Array.isArray(u.licenses)) {
          u.licenses = u.licenses.filter((l: string) => l !== licenseName && l !== slug)
        }
      }
      userManager.saveUsers()
    } catch (_) {}

    try {
      for (const v of vehicleManager.getAll()) {
        if (Array.isArray(v.licenses)) {
          v.licenses = v.licenses.filter((l: string) => l !== licenseName && l !== slug)
        }
      }
      vehicleManager.saveVehicles()
    } catch (_) {}

    try {
      for (const o of orderManager.getAll()) {
        if (Array.isArray(o.licenses)) {
          o.licenses = o.licenses.filter((l: string) => l !== licenseName && l !== slug)
        }
      }
      orderManager.saveOrders()
    } catch (_) {}

    return Ok('deleted')
  }
}

export const licenseManager = new LicenseManager()