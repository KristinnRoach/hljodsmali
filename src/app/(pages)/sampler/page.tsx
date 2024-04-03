import { FC } from 'react';
import Shapes from '../../../components/Shapes/henda.glós';
import SamplerComp from '../../../components/SamplerComp/SamplerComp';

interface pageProps {}

const page: FC<pageProps> = ({}) => {
  return (
    <>
      <SamplerComp />;
      <Shapes />
    </>
  );
};

export default page;
