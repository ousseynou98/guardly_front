'use client';

import { useEffect, useState } from 'react';
import {
  Grid,
  TextField,
  Button,
  MenuItem,
  Card,
  CardContent,
  Switch,
  FormControlLabel,
} from '@mui/material';
import Swal from 'sweetalert2';
import { useTheme } from '@mui/material/styles'; // Import useTheme from MUI
import { useRouter } from 'next/navigation';

interface PlanAbonnement {
  id: string;
  nom: string;
  prix_mensuel: number;
}

export default function CreateUserPage() {
  const router = useRouter()
  const [isClient, setIsClient] = useState(false); // To manage role-specific fields
  const [plansAbonnement, setPlansAbonnement] = useState<PlanAbonnement[]>([]); // Fetch the subscription plans
  const [formErrors, setFormErrors] = useState<any>({}); // For manual validation

  // State for form data
  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    mot_de_passe: '',
    role: 'admin',
    nom_entreprise: '',
    adresse: '',
    latitude: '',
    longitude: '',
    plan_abonnement_id: '',
    statut_abonnement: true,
  });

  const theme = useTheme(); // Get the current theme

  // Fetch subscription plans from FastAPI
  const fetchSubscriptionPlans = async () => {
    try {
      const response = await fetch('http://127.0.0.1:8000/subscription-plans');
      const data = await response.json();
      setPlansAbonnement(data);
    } catch (error) {
      console.error('Error fetching subscription plans:', error);
    }
  };

  useEffect(() => {
    fetchSubscriptionPlans();
  }, []);

  // Handle form data change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Toggle the client-specific fields based on role
    if (name === 'role') {
      setIsClient(value === 'client');
    }
  };

  // Handle switch change for abonnement status
  const handleSwitchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      statut_abonnement: e.target.checked,
    }));
  };

  // Manual validation
  const validateForm = () => {
    const errors: any = {};

    if (!formData.email) errors.email = 'Email requis';
    if (!formData.nom) errors.nom = 'Nom requis';
    if (!formData.mot_de_passe || formData.mot_de_passe.length < 6)
      errors.mot_de_passe = 'Le mot de passe doit comporter au moins 6 caractères';

    if (formData.role === 'client') {
      if (!formData.nom_entreprise) errors.nom_entreprise = "Nom de l'entreprise requis";
      if (!formData.adresse) errors.adresse = 'Adresse requise';
      if (!formData.latitude) errors.latitude = 'Latitude requise';
      if (!formData.longitude) errors.longitude = 'Longitude requise';
      if (!formData.plan_abonnement_id) errors.plan_abonnement_id = "Plan d'abonnement requis";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Return true if no errors
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: 'Veuillez corriger les erreurs dans le formulaire',
        background: theme.palette.mode === 'dark' ? '#333' : '#fff',
        color: theme.palette.mode === 'dark' ? '#fff' : '#000',
        confirmButtonColor: theme.palette.primary.main,
      });
      return;
    }

    const statutAbonnement = formData.statut_abonnement ? 'actif' : 'inactif';

    const userPayload = {
      email: formData.email,
      nom: formData.nom,
      mot_de_passe: formData.mot_de_passe,
      role: formData.role,
    };

    try {
      // POST request to create a user
      const userResponse = await fetch('http://127.0.0.1:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userPayload),
      });

      if (!userResponse.ok) {
        throw new Error("Erreur lors de la création de l'utilisateur");
      }

      const createdUser = await userResponse.json();
      console.log('Utilisateur créé:', createdUser);

      // If the role is 'client', send another request to create the client
      if (formData.role === 'client') {
        const clientPayload = {
          user_id: createdUser.id, // assuming the created user returns an `id` field
          nom_entreprise: formData.nom_entreprise,
          adresse: formData.adresse,
          latitude: formData.latitude,
          longitude: formData.longitude,
          plan_abonnement_id: formData.plan_abonnement_id,
          statut_abonnement: statutAbonnement,
        };

        const clientResponse = await fetch('http://127.0.0.1:8000/clients', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(clientPayload),
        });

        if (!clientResponse.ok) {
          throw new Error('Erreur lors de la création du client');
        }

        const createdClient = await clientResponse.json();
        console.log('Client créé:', createdClient);
      }

      Swal.fire({
        icon: 'success',
        title: 'Succès',
        text: 'Utilisateur créé avec succès',
        background: theme.palette.mode === 'dark' ? '#333' : '#fff',
        color: theme.palette.mode === 'dark' ? '#fff' : '#000',
        confirmButtonColor: theme.palette.primary.main,
      }).then(() => {
        router.push('/user/list'); // Redirect to user list page
      });
    } catch (error) {
      console.error('Erreur lors de la soumission du formulaire:', error);
      Swal.fire({
        icon: 'error',
        title: 'Erreur',
        text: "Une erreur est survenue lors de la création de l'utilisateur",
        background: theme.palette.mode === 'dark' ? '#333' : '#fff',
        color: theme.palette.mode === 'dark' ? '#fff' : '#000',
        confirmButtonColor: theme.palette.primary.main,
      });
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
                value={formData.email}
                onChange={handleChange}
                error={!!formErrors.email}
                helperText={formErrors.email}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Nom"
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                error={!!formErrors.nom}
                helperText={formErrors.nom}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Mot de passe"
                name="mot_de_passe"
                type="password"
                value={formData.mot_de_passe}
                onChange={handleChange}
                error={!!formErrors.mot_de_passe}
                helperText={formErrors.mot_de_passe}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                select
                label="Rôle"
                name="role"
                value={formData.role}
                onChange={handleChange}
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
                    value={formData.nom_entreprise}
                    onChange={handleChange}
                    error={!!formErrors.nom_entreprise}
                    helperText={formErrors.nom_entreprise}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Adresse"
                    name="adresse"
                    value={formData.adresse}
                    onChange={handleChange}
                    error={!!formErrors.adresse}
                    helperText={formErrors.adresse}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Latitude"
                    name="latitude"
                    value={formData.latitude}
                    onChange={handleChange}
                    error={!!formErrors.latitude}
                    helperText={formErrors.latitude}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Longitude"
                    name="longitude"
                    value={formData.longitude}
                    onChange={handleChange}
                    error={!!formErrors.longitude}
                    helperText={formErrors.longitude}
                  />
                </Grid>

                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    select
                    label="Plan d'abonnement"
                    name="plan_abonnement_id"
                    value={formData.plan_abonnement_id}
                    onChange={handleChange}
                    error={!!formErrors.plan_abonnement_id}
                    helperText={formErrors.plan_abonnement_id}
                  >
                    {plansAbonnement.map((plan) => (
                      <MenuItem key={plan.id} value={plan.id}>
                        {plan.nom} - {plan.prix_mensuel} FCFA
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>

                <Grid item xs={12} md={6}>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={formData.statut_abonnement}
                        onChange={handleSwitchChange}
                      />
                    }
                    label="Statut Abonnement (Actif/Inactif)"
                  />
                </Grid>
              </>
            )}

            <Grid item xs={12}>
              <Button type="submit" variant="contained" color="primary">
                Soumettre
              </Button>
            </Grid>
          </Grid>
        </form>
      </CardContent>
    </Card>
  );
}
