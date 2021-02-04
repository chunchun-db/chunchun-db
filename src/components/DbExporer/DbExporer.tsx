import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    Button,
    Card,
    CardContent,
    Container,
    Grid,
    List,
    ListItem,
    ListItemText,
    Box,
    makeStyles,
} from '@material-ui/core';
import { DataGrid, ColDef } from '@material-ui/data-grid';
import { ICollection, IDatabase, IRecord } from '@chunchun-db/client';

import { DbService } from '../../services/DbService';

type DbDictionary = { [key: string]: IDatabase };
type CollectionsDictionary = { [key: string]: ICollection<IRecord> };

const useStyles = makeStyles({
    container: {
        width: '100%',
        flex: 1,
        backgroundColor: 'white',
        padding: '1em',
    },
});

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
        if (!data.length) {
            return [];
        }

        const cols = data.map((item, index) => [Object.keys(item).length, index]);
        cols.sort((a, b) => b[0] - a[0]);
        const mostColumnsItemIndex = cols[0][1];

        return Object.keys(data[mostColumnsItemIndex] || {}).map((key) => ({
            field: key,
            headerName: key,
            flex: 1,
        }));
    }, [data]);

    const classNames = useStyles();

    return (
        <Grid container direction='column' className={classNames.container}>
            <Grid container style={{ flex: 1 }}>
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
                <Grid xs item>
                    <DataGrid
                        columns={columns}
                        rows={data}
                        checkboxSelection
                        density='compact'
                        pageSize={25}
                    />
                </Grid>
            </Grid>
        </Grid>
    );
};
