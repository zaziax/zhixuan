import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar() {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-white/30 border-b border-white/30">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-800 hover:opacity-75 transition-opacity">
            智
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-pink-500">
              玄
            </span>
          </Link>
          
          <div className="flex items-center space-x-8">
            <Link 
              to="/tarot" 
              className={`relative group ${
                location.pathname === '/tarot' 
                  ? 'text-gray-800' 
                  : 'text-gray-600'
              }`}
            >
              <span className="text-sm font-medium">塔罗解析</span>
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300 ${
                location.pathname === '/tarot' ? 'w-full' : ''
              }`} />
            </Link>
            
            <Link 
              to="/iching" 
              className={`relative group ${
                location.pathname === '/iching' 
                  ? 'text-gray-800' 
                  : 'text-gray-600'
              }`}
            >
              <span className="text-sm font-medium">易经演算</span>
              <span className={`absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-full transition-all duration-300 ${
                location.pathname === '/iching' ? 'w-full' : ''
              }`} />
            </Link>

          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar; 