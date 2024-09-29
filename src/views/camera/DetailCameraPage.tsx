"use client"; // Make it a client component

import { useEffect, useState } from 'react';
import { Card, CardContent, Grid, TextField, Button } from '@mui/material';
import { useRouter } from 'next/navigation';

type UserDetailsProps = {
  cameraId: string;
};

interface User {
  id: string;
  nom: string;
  email: string;
  role: string;
  is_client: boolean;
  créé_le: string;
  modifié_le: string;
  client?: ClientDetails; // Optional client details if the user is a client
}

interface ClientDetails {
  nom_entreprise: string;
  adresse: string;
  latitude: string;
  longitude: string;
  plan_abonnement_id: string;
  statut_abonnement: string;
}

export default function CameraDetails({ cameraId }: UserDetailsProps) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null); // State for user data

  // Fetch user details by ID
  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/users/${cameraId}`);
        const data = await response.json();
        setUser(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des détails de l’utilisateur:', error);
      }
    };

    fetchUserDetails();
  }, [cameraId]);

  if (!user) {
    return <p>Chargement des détails de l’utilisateur...</p>;
  }

  return (
    <Card>
      <CardContent>
        <form>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={user.email}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom"
                name="nom"
                value={user.nom}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rôle"
                name="role"
                value={user.role}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            {/* Display client-specific fields if the user is a client */}
            {user.is_client && user.client && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nom de l'entreprise"
                    name="nom_entreprise"
                    value={user.client.nom_entreprise}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Adresse"
                    name="adresse"
                    value={user.client.adresse}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    name="latitude"
                    value={user.client.latitude}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    name="longitude"
                    value={user.client.longitude}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Plan d'abonnement"
                    name="plan_abonnement_id"
                    value={user.client.plan_abonnement_id || 'Aucun plan'}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Statut Abonnement"
                    name="statut_abonnement"
                    value={user.client.statut_abonnement === 'actif' ? 'Actif' : 'Inactif'}
                    InputProps={{
                      readOnly: true,
                    }}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Créé le"
                name="créé_le"
                value={new Date(user.créé_le).toLocaleString()}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Modifié le"
                name="modifié_le"
                value={new Date(user.modifié_le).toLocaleString()}
                InputProps={{
                  readOnly: true,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Button
                variant="contained"
                color="primary"
                onClick={() => router.push('/user/list')}
              >
                Retour à la liste
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
}
