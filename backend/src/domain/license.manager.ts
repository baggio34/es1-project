import { type Result, Err, Ok } from "@/lib/result.ts";
import { slugify } from "@/lib/string.utils.ts";
import { loadObjectFromFile, saveObjectToFile } from "@/services/database/file_operations.ts";

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
    } else {
      console.error(`Error loading licenses: '${result.err}'\nStarting with new data.`)
    }
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

  public delete(slug: string): Result<'deleted', 'noSuchLicense'> {
    if (!this.licenses.has(slug)) return Err('noSuchLicense')
    this.licenses.delete(slug)
    this.saveLicenses()
    return Ok('deleted')
  }
}

export const licenseManager = new LicenseManager()