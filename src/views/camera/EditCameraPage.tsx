"use client"; // Add this at the top of the file

import { useEffect, useState } from 'react';
import { Card, CardContent, Grid, TextField, Button, MenuItem, FormControlLabel, Switch } from '@mui/material';
import Swal from 'sweetalert2';
import { useRouter } from 'next/navigation';

interface PlanAbonnement {
  id: string;
  nom: string;
  prix_mensuel: number;
}

type EditUserProps = {
  cameraId: string;
};

export default function EditCamera({ cameraId }: EditUserProps) {
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [plansAbonnement, setPlansAbonnement] = useState<PlanAbonnement[]>([]);
  
  // Split formData to handle user and client data separately
  const [userData, setUserData] = useState({
    email: '',
    nom: '',
    role: 'admin',
    is_client: false,
  });

  const [clientData, setClientData] = useState({
    nom_entreprise: '',
    adresse: '',
    latitude: '',
    longitude: '',
    plan_abonnement_id: '',
    statut_abonnement: true,
  });

  const [formErrors, setFormErrors] = useState<any>({});

  // Fetch the user data by ID
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/users/${cameraId}`);
        const data = await response.json();

        // Set user-specific data
        setUserData({
          email: data.email,
          nom: data.nom,
          role: data.role,
          is_client: data.is_client,
        });

        // If the user is a client, set client-specific data
        if (data.role === 'client' && data.client) {
          setClientData({
            nom_entreprise: data.client.nom_entreprise,
            adresse: data.client.adresse,
            latitude: data.client.latitude,
            longitude: data.client.longitude,
            plan_abonnement_id: data.client.plan_abonnement_id,
            statut_abonnement: data.client.statut_abonnement === 'actif',
          });
          setIsClient(true);
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des données utilisateur:', error);
      }
    };

    const fetchSubscriptionPlans = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/subscription-plans');
        const data = await response.json();
        setPlansAbonnement(data);
      } catch (error) {
        console.error('Erreur lors de la récupération des plans:', error);
      }
    };

    fetchUserData();
    fetchSubscriptionPlans();
  }, [cameraId]);

  const handleUserChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Toggle client-specific fields based on role
    if (name === 'role') {
      setIsClient(value === 'client');
    }
  };

  const handleClientChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setClientData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setClientData((prev) => ({
      ...prev,
      statut_abonnement: e.target.checked,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Ensure statut_abonnement is sent as a string
    const updatedClientData = {
      ...clientData,
      statut_abonnement: clientData.statut_abonnement ? "actif" : "inactif"
    };

    // Merge userData and updatedClientData into one payload
    const payload = {
      ...userData,
      ...(isClient && { client: updatedClientData }),  // Only include client data if it's a client
    };

    // Log the payload to the console for debugging
    console.log("Payload being sent to the API:", payload);

    try {
      const response = await fetch(`http://127.0.0.1:8000/users/${cameraId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Erreur lors de la mise à jour de l'utilisateur");

      Swal.fire('Succès', 'Utilisateur mis à jour avec succès', 'success').then(() => {
        router.push('/user/list');
      });
    } catch (error) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", error);
      Swal.fire('Erreur', "Une erreur est survenue lors de la mise à jour de l'utilisateur", 'error');
    }
  };


  return (
    <Card>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={userData.email}
                onChange={handleUserChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom"
                name="nom"
                value={userData.nom}
                onChange={handleUserChange}
                error={!!formErrors.nom}
                helperText={formErrors.nom}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Rôle"
                name="role"
                value={userData.role}
                onChange={handleUserChange}
                error={!!formErrors.role}
                helperText={formErrors.role}
              >
                <MenuItem value="client">Client</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
              </TextField>
            </Grid>

            {/* Client-specific fields */}
            {isClient && (
              <>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Nom de l'entreprise"
                    name="nom_entreprise"
                    value={clientData.nom_entreprise}
                    onChange={handleClientChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Adresse"
                    name="adresse"
                    value={clientData.adresse}
                    onChange={handleClientChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    name="latitude"
                    value={clientData.latitude}
                    onChange={handleClientChange}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    name="longitude"
                    value={clientData.longitude}
                    onChange={handleClientChange}
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Plan d'abonnement"
                name="plan_abonnement_id"
                value={clientData.plan_abonnement_id}
                onChange={handleClientChange}
                helperText="Sélectionner un plan d'abonnement"
              >
                {plansAbonnement.map((plan) => (
                  <MenuItem key={plan.id} value={plan.id}>
                    {plan.nom} - {plan.prix_mensuel} FCFA
                  </MenuItem>
                ))}
              </TextField>
            </Grid>

            {isClient && (
              <Grid item xs={12}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={clientData.statut_abonnement}
                      onChange={handleSwitchChange}
                    />
                  }
                  label="Statut Abonnement (Actif/Inactif)"
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Mettre à jour
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
}
