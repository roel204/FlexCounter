import React from 'react'
import ReactDOM from 'react-dom/client'
import {RouterProvider, createHashRouter} from "react-router-dom";
import App from './App.jsx'
import CounterPage from "../CounterPage.jsx";
import '../styles/index.css'

const router = createHashRouter([
    {
        path: "/",
        element: (
                <App />
        ),
        children: [
            {
                path: "/",
                element: <CounterPage />,
            },
        ],
    },
]);

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <RouterProvider router={router} />
    </React.StrictMode>
)
