import { createContext, useContext, useState } from 'react'

const PinContext = createContext(null)

export function PinProvider({ children }) {
  const [profitUnlocked, setProfitUnlocked] = useState(false)

  const unlock = (pin) => {
    if (pin === '2529') {
      setProfitUnlocked(true)
      return true
    }
    return false
  }

  const lock = () => setProfitUnlocked(false)

  return (
    <PinContext.Provider value={{ profitUnlocked, unlock, lock }}>
      {children}
    </PinContext.Provider>
  )
}

export function usePin() {
  return useContext(PinContext)
}
