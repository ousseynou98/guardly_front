import EditUser from 'views/user/EditUserPage';

// ==============================|| USERS - EDIT ||============================== //

type Props = {
  params: {
    id: string;
  };
};

export default function Page({ params }: Props) {
  const { id } = params;

  return <EditUser userId={id} />;
}
