import React from 'react';
import { createRoot } from 'react-dom/client';
import Editor from './components/editor';
import axios from "axios";


const container = document.getElementById('root');
const root = createRoot(container); // createRoot(container!) if you use TypeScript
root.render(<Editor/>);

/* ReactDOM.render(<Editor/> , document.getElementById("root")); */

