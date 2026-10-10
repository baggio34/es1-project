// Classe que descreve um hashMap que consegue buscar tanto pela key quanto pelo value,
// usado para associações 1:1 que precisam ser acessadas por ambos os lados.
export class BiMap<K, V> {
  private keyVal = new Map<K, V>()
  private valKey = new Map<V, K>()

  public getKey(val: V): K | undefined {
    return this.valKey.get(val)
  }

  public getVal(key: K): V | undefined {
    return this.keyVal.get(key)
  }

  public associate(key: K, val: V) {
    const oldVal = this.keyVal.get(key)
    const oldKey = this.valKey.get(val)

    // limpar antigas associações.
    if (oldKey) this.keyVal.delete(oldKey)
    if (oldVal) this.valKey.delete(oldVal)
    this.valKey.set(val, key)
    this.keyVal.set(key, val)
  }
}
