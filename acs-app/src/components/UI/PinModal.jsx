import { useState } from 'react'
import { Lock } from 'lucide-react'
import Modal from './Modal'
import { usePin } from '../../contexts/PinContext'

export default function PinModal({ open, onClose, onSuccess }) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState(false)
  const { unlock } = usePin()

  const submit = () => {
    if (unlock(pin)) {
      setPin('')
      setError(false)
      onSuccess?.()
      onClose()
    } else {
      setError(true)
      setPin('')
      setTimeout(() => setError(false), 1200)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Enter PIN" size="sm">
      <div className="flex flex-col items-center gap-5 py-2">
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${error ? 'bg-red-500/20' : 'bg-accent/10'}`}>
          <Lock size={22} className={error ? 'text-red-400' : 'text-accent'} />
        </div>
        <p className="text-text-secondary text-sm text-center">Enter 4-digit PIN to unlock profit view</p>
        <div className="flex gap-3">
          {[0,1,2,3].map(i => (
            <div key={i} className={`w-10 h-10 rounded-lg border flex items-center justify-center text-lg font-mono font-bold transition-colors ${pin.length > i ? 'border-accent bg-accent/10 text-accent' : 'border-border bg-surface text-text-muted'}`}>
              {pin.length > i ? '●' : ''}
            </div>
          ))}
        </div>
        {error && <p className="text-red-400 text-xs">Incorrect PIN</p>}
        <div className="grid grid-cols-3 gap-2 w-full max-w-[200px]">
          {[1,2,3,4,5,6,7,8,9,'',0,'⌫'].map((k, i) => (
            <button
              key={i}
              disabled={k === ''}
              onClick={() => {
                if (k === '⌫') setPin(p => p.slice(0,-1))
                else if (pin.length < 4) setPin(p => p + k)
              }}
              className={`h-12 rounded-xl font-semibold text-lg transition-colors ${k === '' ? 'invisible' : 'bg-surface border border-border text-text-primary hover:bg-border active:scale-95'}`}
            >
              {k}
            </button>
          ))}
        </div>
        <button
          onClick={submit}
          disabled={pin.length !== 4}
          className="btn-primary w-full disabled:opacity-40"
        >
          Unlock
        </button>
      </div>
    </Modal>
  )
}
