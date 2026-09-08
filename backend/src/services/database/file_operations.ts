import * as fs from "fs"
import { Err, Ok, type Result } from "@/lib/result.ts"

export function saveObjectToFile(path: string, obj: any): Result<'saved', string> {
  try {
    const jsonString = JSON.stringify(obj, null, 2)
    fs.writeFileSync(path, jsonString, 'utf8')
    return Ok('saved')
  } catch (error) {
    return Err(`Error saving file: '${String(error)}'`)
  }
}

export function loadObjectFromFile<T>(path: string): Result<T, string> {
  try {
    if (!fs.existsSync(path)) return Err("File does not exist.")
    const fileContent = fs.readFileSync(path, 'utf8')
    const obj: T = JSON.parse(fileContent)
    return Ok(obj)
  } catch (error) {
    return Err(`Error loading file: '${String(error)}'`)
  }
}
