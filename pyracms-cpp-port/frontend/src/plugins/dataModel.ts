// Data model definition for plugins
export interface PluginDataModel {
  name: string
  fields: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'date' | 'json' | 'relation'
      required?: boolean
      default?: any
      relation?: {
        model: string
        type: 'one-to-one' | 'one-to-many' | 'many-to-one' | 'many-to-many'
      }
    }
  }
  apiEndpoints?: {
    list?: string
    create?: string
    read?: string
    update?: string
    delete?: string
  }
}
