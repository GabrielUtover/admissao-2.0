import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from './ui/dialog'
import { Input } from './ui/input'
import { Button } from './ui/button'
import { Label } from './ui/label'

interface PasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const PASSWORD = 'Incons55522'

export function PasswordDialog({
  open,
  onOpenChange,
  onSuccess,
}: PasswordDialogProps) {
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === PASSWORD) {
      setError('')
      setPassword('')
      onSuccess()
      onOpenChange(false)
    } else {
      setError('Senha incorreta')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-700">
            Acesso Restrito
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            Digite a senha para acessar as configurações
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setError('')
              }}
              placeholder="Digite a senha"
              autoFocus
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false)
                setPassword('')
                setError('')
              }}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              className="!bg-slate-700 hover:!bg-slate-800 !text-white border-0"
            >
              Confirmar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

