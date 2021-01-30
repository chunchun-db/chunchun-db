import React, { useCallback, useState } from 'react';
import logo from './logo.svg';
import './App.css';
import { ConnectionForm } from '../ConnectionForm/ConnectionForm';
import { DbService } from '../../services/DbService';
import { DbExporer } from '../DbExporer/DbExporer';

const dbServiceInstance = DbService.getInstance();

function App() {
    const [isConnected, setIsConnected] = useState(false);

    const handleConnect = useCallback(({ hostName, port }) => {
        dbServiceInstance.connect({ hostName, port }).then(() => setIsConnected(true));
    }, []);

    return (
        <div className='App'>
            {!isConnected && <ConnectionForm onConnect={handleConnect} />}
            {isConnected && <DbExporer />}
        </div>
    );
}

export default App;
