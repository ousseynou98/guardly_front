import UserDetails from 'views/user/DetailUserPage';

// ==============================|| USERS - DETAILS ||============================== //

type Props = {
    params: {
      id: string;
    };
  };
  
  export default function Page({ params }: Props) {
    const { id } = params;
  
    return <UserDetails userId={id} />;
  }