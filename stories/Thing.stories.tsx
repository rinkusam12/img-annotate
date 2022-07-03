import { Meta } from '@storybook/react';
import { ImageAnnoateProps, ImageAnnotate } from '../src';

const meta: Meta = {
  title: 'ImageAnnotate',
  component: ImageAnnotate,
};

export default meta;

const Template = (args: ImageAnnoateProps) => (
  <div style={{ maxWidth: '700px' }}>
    <ImageAnnotate {...args} />
  </div>
);

export const Image = Template.bind({});
Image.args = {
  imgSrc:"https://images.pexels.com/photos/12610341/pexels-photo-12610341.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
  tags: [ { title:"hello", color:"aqua" } ]
};
