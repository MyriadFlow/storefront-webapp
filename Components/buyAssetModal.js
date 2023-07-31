import { Box, Modal, Typography } from '@mui/material';
import * as React from 'react';
import { Button } from 'react-bootstrap';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'black',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};
export default function BuyAsset({open , setOpen , message}) {
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <div>
      <Button onClick={handleOpen}>Open modal</Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="text-center">
          <Typography id="modal-modal-title" variant="h6" component="h2" className='text-center text-gray-500 dark:text-white'>
            {message}
          </Typography>
        
        </Box>
      </Modal>
    </div>
  );
}