import ConfigCamera from 'views/camera/ConfigCameraPage';

// ==============================|| USERS - EDIT ||============================== //

type Props = {
  params: {
    id: string;
  };
};

export default function Page({ params }: Props) {
  const { id } = params;

  return <ConfigCamera cameraId={id} />;
}
