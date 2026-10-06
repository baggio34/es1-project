declare global {
  interface Array<T> {
    removeFindOne(predicate: (item: T) => boolean): void
    removeOne(searchFor: T): void
    removeAt(index: number): void
    insertAt(index: number, element: T): void
  }
}

Array.prototype.removeFindOne = function <T>(this: T[], predicate: (item: T) => boolean) {
  const index = this.findIndex(predicate)
  if (index == -1) return
  this.splice(index, 1)
}
Array.prototype.removeOne = function <T>(this: T[], searchFor: T) {
  const index = this.indexOf(searchFor)
  if (index == -1) return
  this.splice(index, 1)
}
Array.prototype.removeAt = function <T>(this: T[], index: number) {
  if (index < 0 || index >= this.length) return
  this.splice(index, 1)
}
Array.prototype.insertAt = function <T>(this: T[], index: number, element: T) {
  if (index < 0 || index > this.length) return
  this.splice(index, 0, element)
}
