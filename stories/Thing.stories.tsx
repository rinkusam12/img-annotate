import { Meta } from '@storybook/react';
import { useState } from 'react';
import { CommonImageAnnotateProps, Cooridante, ImageAnnotate } from '../src';

const meta: Meta = {
  title: 'ImageAnnotate',
  component: ImageAnnotate,
};

export default meta;

const Template = (args: CommonImageAnnotateProps) => {
  const [cords, setCords] = useState<Cooridante[]>([]);
  return (
    <div style={{ maxWidth: '700px' }}>
      <ImageAnnotate
        cordinates={cords}
        {...args}
      />
      <button onClick={() => {
        setCords([]);
      }}>Reset</button>
    </div>
  );
};

export const Image = Template.bind({});
Image.args = {
  imgSrc:
    'https://images.pexels.com/photos/12610341/pexels-photo-12610341.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
  tags: [{ title: 'hello', color: 'aqua' }],
};
