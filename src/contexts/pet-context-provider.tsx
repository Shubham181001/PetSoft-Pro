"use client";
import { addPet, deletePet, editPet } from "@/actions/actions";
import { PetEssentials } from "@/lib/types";
import { Pet } from "@prisma/client";
import { createContext, startTransition, useOptimistic, useState } from "react";
import { toast } from "sonner";

type TPetContext = {
  pets: Pet[];
  selectedPetId: Pet["id"] | null;
  selectedPet: Pet | undefined;
  numberOfPets: number;
  onCheckoutPet: (id: Pet["id"]) => Promise<void>;
  onChangeSelectedPetId: (id: Pet["id"]) => void;
  onAddPet: (newPet: PetEssentials) => Promise<void>;
  onEditPet: (petId: Pet["id"], editedPetData: PetEssentials) => Promise<void>;
};

type PetContextProviderProps = {
  children: React.ReactNode;
  data: Pet[];
};

export const PetContext = createContext<TPetContext | null>(null);

export default function PetContextProvider({
  children,
  data,
}: PetContextProviderProps) {
  // states
  const [optimisticPets, setOptimisticPets] = useOptimistic(
    data,
    (state, { action, payload }) => {
      switch (action) {
        case "add":
          console.log("Adding pet optimistically", payload);
          return [...state, { ...payload, id: Math.random().toString() }];
        case "edit":
          return state.map((pet) => {
            if (payload.id === pet.id) {
              return { ...pet, ...payload.editedPetData };
            }
            return pet;
          });
        case "delete":
          return state.filter((pet) => pet.id !== payload.petId);
        default:
          return state;
      }
    }
  );
  const [selectedPetId, setSelectedPetId] = useState<Pet["id"] | null>(null);

  // derived states
  const selectedPet = optimisticPets.find((pet) => pet.id === selectedPetId);
  const numberOfPets = optimisticPets.length;

  // event handlers / actions
  const handleAddPet = async (newPet: PetEssentials) => {
    setOptimisticPets({ action: "add", payload: newPet });
    const error = await addPet(newPet);
    if (error) {
      toast.warning(error.message);
      return;
    }
  };

  const handleEditPet = async (
    petId: Pet["id"],
    editedPetData: PetEssentials
  ) => {
    setOptimisticPets({
      action: "edit",
      payload: { id: petId, editedPetData },
    });
    const error = await editPet(petId, editedPetData);
    if (error) {
      toast.warning(error.message);
      return;
    }
  };

  const handleCheckoutPet = async (petId: Pet["id"]) => {
    startTransition(() => {
      setOptimisticPets({ action: "delete", payload: { petId } });
    });
    const error = await deletePet(petId);
    if (error) {
      toast.warning(error.message);
      return;
    }
    setSelectedPetId(null);
  };
  const handleChangeSelectedPetId = (id: Pet["id"]) => {
    setSelectedPetId(id);
  };

  return (
    <PetContext.Provider
      value={{
        pets: optimisticPets,
        selectedPetId,
        selectedPet,
        numberOfPets,
        onCheckoutPet: handleCheckoutPet,
        onChangeSelectedPetId: handleChangeSelectedPetId,
        onAddPet: handleAddPet,
        onEditPet: handleEditPet,
      }}
    >
      {children}
    </PetContext.Provider>
  );
}
