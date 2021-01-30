import { useEffect, useMemo, useRef, useState } from 'react';
import {
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    List,
    ListItem,
    ListItemText,
} from '@material-ui/core';
import { DataGrid, ColDef } from '@material-ui/data-grid';
import { ICollection, IDatabase, IRecord } from '@chunchun-db/client';

import { DbService } from '../../services/DbService';

type DbDictionary = { [key: string]: IDatabase };
type CollectionsDictionary = { [key: string]: ICollection<IRecord> };

export const DbExporer = () => {
    const [data, setData] = useState<IRecord[]>([]);
    const [dbList, setDbList] = useState<string[]>([]);
    const [selectedDb, setSelectedDb] = useState<string>();

    const dbInstances = useRef<DbDictionary>({});

    const [collections, setCollections] = useState<string[]>([]);
    const [selectedCollection, setSelectedCollection] = useState<string>();

    const collectionInstances = useRef<CollectionsDictionary>({});

    const [isNavHidden, setIsNavHidden] = useState(false);
    const toggleHidden = () => setIsNavHidden((val) => !val);

    useEffect(() => {
        const dbService = DbService.getInstance();
        dbService.getAllDatabases().then((dbs) => {
            dbInstances.current =
                dbs?.reduce((acc, curr) => {
                    acc[curr.name] = curr;
                    return acc;
                }, {} as DbDictionary) || {};

            const dbNames = dbs?.map((db) => db.name) || [];
            setDbList(dbNames);
            setSelectedDb(dbNames[0]);
        });
    }, []);

    useEffect(() => {
        if (selectedDb) {
            dbInstances.current[selectedDb].getAllCollections().then((collections) => {
                const colNames = collections.map((col) => col.name);

                collectionInstances.current =
                    collections?.reduce((acc, curr) => {
                        acc[curr.name] = curr;
                        return acc;
                    }, {} as CollectionsDictionary) || {};

                setCollections(colNames);
                setSelectedCollection(colNames[0]);
            });
        } else {
            setCollections([]);
        }
    }, [selectedDb]);

    useEffect(() => {
        if (selectedCollection) {
            collectionInstances.current[selectedCollection].getAll().then(setData);
        } else {
            setData([]);
        }
    }, [selectedCollection]);

    const columns: ColDef[] = useMemo(() => {
        return Object.keys(data[0] || {}).map((key) => ({
            field: key,
            headerName: key,
            flex: 1,
        }));
    }, [data]);

    return (
        <Container>
            <Card>
                <CardContent>
                    <Grid container>
                        {!isNavHidden && (
                            <Grid item xs={4}>
                                <Grid container>
                                    <Grid item xs>
                                        <List>
                                            {dbList.map((dbname) => (
                                                <ListItem
                                                    key={dbname}
                                                    button
                                                    selected={dbname === selectedDb}
                                                    onClick={() => setSelectedDb(dbname)}
                                                >
                                                    <ListItemText>{dbname}</ListItemText>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Grid>
                                    <Grid item xs>
                                        <List>
                                            {collections.map((colName) => (
                                                <ListItem
                                                    key={colName}
                                                    button
                                                    selected={colName === selectedCollection}
                                                    onClick={() => setSelectedCollection(colName)}
                                                >
                                                    <ListItemText>{colName}</ListItemText>
                                                </ListItem>
                                            ))}
                                        </List>
                                    </Grid>
                                </Grid>
                            </Grid>
                        )}
                        <Grid>
                            <Button onClick={toggleHidden}>{isNavHidden ? 'Show' : 'Hide'}</Button>
                        </Grid>
                        <Grid xs item style={{ height: '40em' }}>
                            <DataGrid
                                columns={columns}
                                rows={data}
                                checkboxSelection
                                density='compact'
                            />
                        </Grid>
                    </Grid>
                </CardContent>
            </Card>
        </Container>
    );
};
