'use client';                                                                
                                                                              
import React, { useState, FormEvent } from 'react';
import { supabase } from '@/lib/supabase';
import toast, { Toaster } from 'react-hot-toast';
                                                                             
interface AuthFormProps {                                                    
  mode: 'login' | 'signup';                                                  
}                                                                            
                                                                             
export const AuthForm: React.FC<AuthFormProps> = ({ mode }) => {             
  const [email, setEmail] = useState('');                                    
  const [password, setPassword] = useState('');                              
  const [error, setError] = useState<string | null>(null);                   
                                                                             
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {            
    e.preventDefault();                                                      
    setError(null);                                                          
                                                                             
    try {                                                                    
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('Check your email for the confirmation link.', {
          duration: 5000,
          position: 'top-center',
        });
      } else {                                                               
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        window.location.href = '/'; // Redirect to home page after successfu login
      }
    } catch (error) {
      if (error instanceof Error) {
        setError(error.message);
        toast.error(error.message, {
          duration: 5000,
          position: 'top-center',
        });
      } else {
        setError('An unknown error occurred');
        toast.error('An unknown error occurred', {
          duration: 5000,
          position: 'top-center',
        });
      }
    }
  };

  return (
    <>
      <Toaster />
      <form onSubmit={handleSubmit} className="space-y-4 bg-zinc-100 p-6 rounded-lg">                     
        {error && <div className="text-red-500">{error}</div>}                 
        <div>                                                                  
          <label htmlFor="email" className="block mb-1 text-zinc-700">Email</label>          
          <input                                                               
            type="email"                                                       
            id="email"                                                         
            value={email}                                                      
            onChange={(e) => setEmail(e.target.value)}                         
            required                                                           
            className="w-full px-3 py-2 border border-zinc-300 rounded bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent"                        
            aria-label="Email"                                                 
          />                                                                   
        </div>                                                                 
        <div>                                                                  
          <label htmlFor="password" className="block mb-1 text-zinc-700">Password</label>    
          <input                                                               
            type="password"                                                    
            id="password"                                                      
            value={password}                                                   
            onChange={(e) => setPassword(e.target.value)}                      
            required                                                           
            className="w-full px-3 py-2 border border-zinc-300 rounded bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-600 focus:border-transparent"                        
            aria-label="Password"                                              
          />                                                                   
        </div>                                                                 
        <button type="submit" className="w-full bg-zinc-600 text-white py-2    
  rounded hover:bg-zinc-700 transition duration-200">                                                                    
          {mode === 'login' ? 'Log In' : 'Sign Up'}                            
        </button>                                                              
      </form>    
    </>                                                              
  );                                                                         
};    
