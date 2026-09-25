import { useState } from 'react'

/** The "Add menu item" form fields. */
export function useNewMenuItemForm() {
  const [newName, setNewName] = useState('')
  const [newRoute, setNewRoute] = useState('')
  const [newPosition, setNewPosition] = useState('')
  const [newPermissions, setNewPermissions] = useState('public')
  const [newType, setNewType] = useState('route')
  const [newParent, setNewParent] = useState(0)
  const reset = () => {
    setNewName('')
    setNewRoute('')
    setNewPosition('')
    setNewPermissions('public')
    setNewType('route')
    setNewParent(0)
  }
  return {
    fields: {
      newName,
      setNewName,
      newRoute,
      setNewRoute,
      newPosition,
      setNewPosition,
      newPermissions,
      setNewPermissions,
      newType,
      setNewType,
      newParent,
      setNewParent,
    },
    reset,
  }
}
