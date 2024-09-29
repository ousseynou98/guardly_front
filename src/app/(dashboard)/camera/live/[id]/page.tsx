import LiveCamera from 'views/camera/LiveCameraPage';

// ==============================|| USERS - EDIT ||============================== //

type Props = {
  params: {
    id: string;
  };
};

export default function Page({ params }: Props) {
  const { id } = params;

  return <LiveCamera cameraId={id} />;
}
