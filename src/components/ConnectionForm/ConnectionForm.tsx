import {
    Card,
    CardContent,
    makeStyles,
    TextField,
    Typography,
    Box,
    Button,
} from '@material-ui/core';
import { ChangeEvent, useMemo, useState } from 'react';

const defaultHost = 'http://localhost';

const useStyles = makeStyles({
    root: {
        //    display: 'flex',
        //    alignItems: "baseline",
    },
    separator: {
        margin: '0 0.5em',
    },
    inputs: {
        display: 'flex',
        alignItems: 'baseline',
    },
    buttonContainer: {
        marginTop: '1em',
        display: 'flex',
        justifyContent: 'center',
    },
});

type ErrorDictionary = { [key: string]: string[] };

type ConnectionFormProps = {
    onConnect: ({ hostName, port }: { hostName: string; port: number }) => void;
};

const localStorageHost = 'lastUsedHostname';
const localStoragePort = 'lastUsedPort';

export const ConnectionForm = ({ onConnect }: ConnectionFormProps) => {
    const [hostName, setHostname] = useState(localStorage.getItem(localStorageHost) || defaultHost);
    const [port, setPort] = useState(localStorage.getItem(localStoragePort) || '');

    const [errors, setErrors] = useState<ErrorDictionary>({
        hostName: [],
        port: [],
    });

    const hasErrors = useMemo(() => Object.values(errors).some((val) => val?.length), [errors]);

    const handleHostChange = (e: ChangeEvent<HTMLInputElement>) => setHostname(e.target.value);
    const handlePortChange = (e: ChangeEvent<HTMLInputElement>) => {
        setPort(e.target.value);
        if (!Number(e.target.value)) {
            setErrors((errors) => ({
                ...errors,
                port: [...errors.port, 'Port value should be a number'],
            }));
        } else if (errors['port'].length) {
            setErrors((errors) => ({ ...errors, port: [] }));
        }
    };

    const handleConnect = () => {
        localStorage.setItem(localStorageHost, hostName);
        localStorage.setItem(localStoragePort, port);
        onConnect({ hostName, port: Number(port) });
    };

    const classNames = useStyles();

    return (
        <Card variant='outlined' className={classNames.root}>
            <CardContent>
                <form>
                    <Box className={classNames.inputs}>
                        <TextField
                            label='Hostname'
                            value={hostName}
                            error={!!errors['hostName']?.length}
                            onChange={handleHostChange}
                        />
                        <Typography variant='caption' className={classNames.separator}>
                            :
                        </Typography>
                        <TextField
                            label='Port'
                            value={port}
                            error={!!errors['port']?.length}
                            onChange={handlePortChange}
                        />
                    </Box>
                    <Box className={classNames.buttonContainer}>
                        <Button color='primary' disabled={hasErrors} onClick={handleConnect}>
                            Connect
                        </Button>
                    </Box>
                </form>
            </CardContent>
        </Card>
    );
};
