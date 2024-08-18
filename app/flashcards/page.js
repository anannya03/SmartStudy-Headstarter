﻿'use client';

import { useUser } from '@clerk/nextjs';
import { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { db } from '@/firebase';
import { Container, Grid, Box, Typography, Card, CardActionArea, CardContent } from '@mui/material';
import { useSearchParams, useRouter } from 'next/navigation';
import CustomAppBar from "@/app/appbar";
import Flashcard from "@/app/flashcard/page.js";

export default function Flashcards() {
    const {isLoaded, isSignedIn, user} = useUser();
    const [collections, setCollections] = useState([]);
    const [flashcards, setFlashcards] = useState([]);
    const [flipped, setFlipped] = useState({});
    const searchParams = useSearchParams();
    const search = searchParams.get('id');
    const router = useRouter();

    useEffect(() => {
        async function getCollections() {
            if (!user) {
                return;
            }
            const userDocRef = doc(collection(db, 'users'), user.id);
            const docSnap = await getDoc(userDocRef);

            if (docSnap.exists()) {
                const data = docSnap.data();
                setCollections(data.flashcards || []);
            }
        }

        getCollections();
    }, [user]);

    useEffect(() => {
        async function getFlashcards() {
            if (!search || !user) {
                return;
            }
            const colRef = collection(doc(collection(db, 'users'), user.id), search);
            const docs = await getDocs(colRef);
            const flashcards = [];

            docs.forEach((doc) => {
                flashcards.push({id: doc.id, ...doc.data()});
            });
            setFlashcards(flashcards);
        }

        getFlashcards();
    }, [user, search]);

    const handleCollectionClick = (name) => {
        router.push(`/flashcards?id=${name}`);
    };

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id],
        }));
    };

    if (!isLoaded || !isSignedIn) {
        return <></>;
    }

    return (
        <>
            <CustomAppBar/>
            <Container maxWidth="md">
                {!search ? (
                    <Box sx={{mt: 4, mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <Typography variant="h4">Your Flashcard Collections</Typography>
                        <Grid container spacing={3} sx={{mt: 4}}>
                            {collections.map((collection, index) => (
                                <Grid item xs={12} sm={6} md={4} key={index}>
                                    <Card>
                                        <CardActionArea onClick={() => handleCollectionClick(collection.name)}>
                                            <CardContent>
                                                <Typography variant="h5" component="div">
                                                    {collection.name}
                                                </Typography>
                                            </CardContent>
                                        </CardActionArea>
                                    </Card>
                                </Grid>
                            ))}
                        </Grid>
                    </Box>
                ) : (
                    <Flashcard/>
                )}
            </Container>
        </>
    );
}