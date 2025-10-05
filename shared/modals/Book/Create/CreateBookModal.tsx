import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { PublicKey } from '@solana/web3.js';
import { AddBookForm } from 'shared/forms/book/CreateBookForm';

const CreateBookModal = ({
  modalState,
  library,
}: {
  modalState: any;
  library: PublicKey;
}) => {
  return (
    <Dialog {...modalState}>
      <DialogContent className="max-w-2xl w-full max-h-[calc(100vh-4rem)] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create new book</DialogTitle>
          <DialogDescription>
            Fill the form below to create a new book.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <AddBookForm library={library} />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateBookModal;
