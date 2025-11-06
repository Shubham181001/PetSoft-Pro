"use client";
import { usePetContext } from "@/lib/hooks";
import Image from "next/image";
import PetButton from "./pet-button";
import { Pet } from "@prisma/client";

type Props = {
  pet: Pet;
};

export default function PetDetails() {
  const { selectedPet } = usePetContext();
  return (
    <section className="flex flex-col w-full h-full">
      {!selectedPet ? (
        <EmptyView />
      ) : (
        <>
          <PetDetailsHeader pet={selectedPet} />
          <PetInfo pet={selectedPet} />
          <PetNotes pet={selectedPet} />
        </>
      )}
    </section>
  );
}

function EmptyView() {
  return (
    <p className="flex items-center justify-center h-full font-medium text-2xl">
      No Pet Selected
    </p>
  );
}

function PetDetailsHeader({ pet }: Props) {
  const { onCheckoutPet } = usePetContext();
  return (
    <div className="flex items-center px-8 py-5 bg-white border-b border-black-[0.08]">
      <Image
        src={pet.imageUrl}
        alt="Selected Pet Image"
        width={75}
        height={75}
        className="w-[75px] h-[75px] rounded-full object-cover"
      />
      <h2 className="text-3xl font-semibold leading-7 ml-5">{pet.name}</h2>
      <div className="ml-auto space-x-2">
        <PetButton actionType="edit">Edit</PetButton>
        <PetButton
          onClick={async () => await onCheckoutPet(pet.id)}
          actionType="checkout"
        >
          Checkout
        </PetButton>
      </div>
    </div>
  );
}

function PetInfo({ pet }: Props) {
  return (
    <div className="flex justify-around py-10 px-5 text-center">
      <div>
        <h3 className="text-[13px] font-medium uppercase text-zinc-700">
          Owner name
        </h3>
        <p className="text-lg mt-1 text-zinc-800">{pet.ownerName}</p>
      </div>
      <div>
        <h3 className="text-[13px] font-medium uppercase text-zinc-700">Age</h3>
        <p className="text-lg mt-1 text-zinc-800">{pet.age}</p>
      </div>
    </div>
  );
}

function PetNotes({ pet }: Props) {
  return (
    <section className="flex-1 bg-white px-7 py-5 rounded-md mb-9 mx-8 border border-black/[0.08]">
      {pet.notes}
    </section>
  );
}
