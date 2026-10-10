import React, { useState } from 'react'
import { Button } from '../../components/ui/button.tsx'
import { Input } from '../../components/ui/input.tsx'
import { Truck, Lock, User, ArrowRight } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext.tsx'

export const LoginPage: React.FC = () => {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    login(username, password)
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      width: '100vw',
      backgroundColor: '#f8fafc',
      fontFamily: 'var(--font-sans)',
    }}>
      {/* LEFT SIDE - BRANDING */}
      <div style={{
        flex: 1,
        backgroundColor: '#0052cc', // Azul do sistema, corporativo e elegante
        backgroundImage: 'linear-gradient(135deg, #0052cc 0%, #003d99 100%)',
        color: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '4rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Elemento de background decorativo */}
        <div style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
          zIndex: 0
        }} />
        
        <div style={{ position: 'relative', zIndex: 1, maxWidth: '500px' }}>
          <div style={{ 
            display: 'inline-flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
            padding: '1rem',
            borderRadius: '1rem',
            marginBottom: '2rem',
            backdropFilter: 'blur(10px)'
          }}>
            <Truck size={48} color="#ffffff" strokeWidth={1.5} />
          </div>
          <h1 style={{ 
            fontSize: '3rem', 
            fontWeight: 800, 
            letterSpacing: '-0.02em', 
            lineHeight: 1.1,
            marginBottom: '1.5rem' 
          }}>
            Gestão Logística Integrada
          </h1>
          <p style={{ 
            fontSize: '1.125rem', 
            lineHeight: 1.6, 
            color: 'rgba(255, 255, 255, 0.85)',
            fontWeight: 400
          }}>
            Acompanhe suas frotas, gerencie pedidos e otimize rotas com eficiência e segurança através de nosso sistema corporativo de última geração.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE - LOGIN FORM */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#ffffff',
        padding: '2rem',
        boxShadow: '-10px 0 30px rgba(0,0,0,0.05)',
        zIndex: 10
      }}>
        <div style={{ width: '100%', maxWidth: '420px' }}>
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: '#1e293b', marginBottom: '0.5rem', letterSpacing: '-0.01em' }}>
              Acesso ao Sistema
            </h2>
            <p style={{ color: '#64748b', fontSize: '1rem' }}>
              Insira suas credenciais corporativas
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label htmlFor="username" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.5rem'
              }}>
                <User size={16} color="#64748b" />
                Nome de Usuário
              </label>
              <Input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="ex: admin ou motorista1"
                required
                style={{ 
                  height: '3rem', 
                  fontSize: '1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'none'
                }}
              />
            </div>
            
            <div>
              <label htmlFor="password" style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#334155',
                marginBottom: '0.5rem'
              }}>
                <Lock size={16} color="#64748b" />
                Senha de Acesso
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Sua senha corporativa"
                required
                style={{ 
                  height: '3rem', 
                  fontSize: '1rem',
                  borderRadius: '0.5rem',
                  backgroundColor: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  boxShadow: 'none'
                }}
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              style={{ 
                height: '3rem', 
                fontSize: '1.05rem', 
                fontWeight: 600, 
                marginTop: '1rem',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#0052cc',
                color: '#ffffff',
                border: 'none',
                borderRadius: '0.5rem',
                cursor: 'pointer',
                transition: 'background-color 0.2s ease',
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#003d99'}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#0052cc'}
            >
              Entrar no Sistema
              <ArrowRight size={18} />
            </Button>
          </form>

          <div style={{ marginTop: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '0.5rem', fontSize: '0.8125rem', color: '#64748b', textAlign: 'center' }}>
            <strong>Usuários de Teste (Mock):</strong><br/>
            admin (Admin) | gerente.log (Manager) <br/>
            joao.atend (Clerk) | carlos.mot (Driver)
          </div>

          <div style={{ marginTop: '1.5rem', textAlign: 'center', color: '#94a3b8', fontSize: '0.875rem' }}>
            &copy; 2026 Sistema Integrado de Transportes. Todos os direitos reservados.
          </div>
        </div>
      </div>
    </div>
  )
}
