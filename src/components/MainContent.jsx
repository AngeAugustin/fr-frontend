import React from 'react';
import { useSidebar } from '../contexts/SidebarContext';
import './MainContent.css';

const MainContent = ({ children }) => {
  const { sidebarWidth } = useSidebar();

  return (
    <main 
      className="main-content"
      style={{ 
        marginLeft: `${sidebarWidth}px`,
        width: `calc(100% - ${sidebarWidth}px)`
      }}
    >
      {children}
    </main>
  );
};

export default MainContent;
