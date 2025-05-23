import { useAuth0 } from "@auth0/auth0-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { nanoid } from "nanoid";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { dietaryConsiderations } from "../categories/dietaryConsiderations";
import { dishCategories } from "../categories/dishCategories";
import { capitalizeFirstLetter } from "../functions/functions";
import usePostDish from "../hooks/usePostDish";
import usePutEvent from "../hooks/usePutEvent";
import usePutUser from "../hooks/usePutUser";
import useUserByEmail from "../hooks/useUserByEmail";
import { EventDocumentType } from "../interfaces/interfaces";

const dishSchema = z.object({
  userName: z
    .string()
    .trim()
    .min(2, { message: "Enter at least 2 characters" })
    .max(50),
  category: z.enum(dishCategories, {
    errorMap: () => ({ message: "Category is required" }),
  }),
  name: z
    .string()
    .trim()
    .min(2, { message: "Enter at least 2 characters" })
    .max(50),
  amount: z.number({ invalid_type_error: "Amount is required" }).min(1).max(99),
  dietary: z.enum(dietaryConsiderations).array().optional(),
});

export type DishFormData = z.infer<typeof dishSchema>;

interface Props {
  selectedEvent: EventDocumentType;
  // onSubmit: (data: DishFormData) => void;
}

const DishForm = ({ selectedEvent }: Props) => {
  // returns object
  const {
    register,
    // trigger,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<DishFormData>({
    resolver: zodResolver(dishSchema),
    defaultValues: {
      dietary: [],
    },
  });

  const { mutateAsync: postDishMutateAsync } = usePostDish();

  // put Event
  const { mutateAsync: putEventMutateAsync } = usePutEvent(selectedEvent);

  const { user: auth0User } = useAuth0();

  // dependent query, dependent on useUser parameter
  let {
    data: user,
    error: errorUser,
    isLoading: isLoadingUser,
  } = useUserByEmail(auth0User?.email!);

  const { mutateAsync: putUserMutateAsync } = usePutUser();

  if (isLoadingUser) {
    return <p>Loading...</p>;
  }

  if (errorUser) {
    return <p>Error: {errorUser.message}</p>;
  }

  return (
    <form
      // handleSubmit from react hook form, this function will receive the form data if form validation is successful
      // data is ready to send to the server
      onSubmit={handleSubmit(async (newDishFormData) => {
        const publicId = nanoid();

        const newDishWithPublicId = {
          ...newDishFormData,
          publicId: publicId,
        };

        const resultDishFromMutate = await postDishMutateAsync(
          newDishWithPublicId
        );

        console.log(resultDishFromMutate);

        // adding dish to event

        if (resultDishFromMutate === undefined)
          throw new Error("resultDish is undefined");

        const resultDishId = resultDishFromMutate._id?.toString();

        if (resultDishId === undefined)
          throw new Error("resultDishId is undefined");
        if (selectedEvent.dishes === undefined)
          throw new Error("selectedEvent.dishes is undefined");

        // add newDish id to selectedEvent
        selectedEvent.publicId !== "none"
          ? selectedEvent.dishes.push(resultDishId)
          : new Error("no event selected");

        const selectedEventWithoutId = { ...selectedEvent };
        delete selectedEventWithoutId._id;

        const resultEventFromMutate = await putEventMutateAsync(
          selectedEventWithoutId
        );

        console.log(resultEventFromMutate);

        // add newDish id to user.dishesOwned
        if (user === undefined) throw new Error("user is undefined");
        if (user._id === undefined) throw new Error("user id is undefined");

        user.publicId !== "none"
          ? user.dishesOwned!.push(newDishWithPublicId.publicId)
          : new Error("no user selected");

        const userWithoutId = { ...user };
        delete userWithoutId._id;

        const resultUserFromMutate = await putUserMutateAsync({
          itemId: user._id.toString(),
          data: userWithoutId,
        });

        console.log(resultUserFromMutate);

        reset();
      })}
    >
      <div className="mb-3">
        <label htmlFor="userName" className="form-label">
          Your Name
        </label>
        <input
          {...register("userName")}
          id="userName"
          type="text"
          className="form-control"
        />
        {errors.userName && (
          <p className="text-danger">{errors.userName.message}</p>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="category" className="form-label">
          Category
        </label>
        {/* // hook form register function, spread result, copy all previous values */}
        <select {...register("category")} id="category" className="form-select">
          <option value="Select">Select Dish Category</option>
          {dishCategories.map((category) => (
            <option key={category} value={category}>
              {capitalizeFirstLetter(category)}
            </option>
          ))}
        </select>
        {errors.category && (
          <p className="text-danger">{errors.category.message}</p>
        )}
      </div>

      <div className="mb-3">
        <label htmlFor="name" className="form-label">
          Dish Name
        </label>
        <input
          {...register("name")}
          id="name"
          type="text"
          className="form-control"
        />
        {errors.name && <p className="text-danger">{errors.name.message}</p>}
      </div>

      <div className="mb-3">
        <label htmlFor="amount" className="form-label">
          Amount
        </label>
        <input
          {...register("amount", { valueAsNumber: true })}
          id="amount"
          type="number"
          className="form-control"
        />
        {errors.amount && (
          <p className="text-danger">{errors.amount.message}</p>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label">
          Dietary Considerations Included (optional)
        </label>
        {dietaryConsiderations.map((diet, index) => (
          // had to add key to div
          <div className="form-check" key={index}>
            <input
              {...register("dietary")}
              id={diet}
              className="form-check-input"
              type="checkbox"
              key={diet}
              value={diet}
            />
            <label className="form-check-label" htmlFor="dietary">
              {diet}
            </label>
          </div>
        ))}
        {/* 
        // bootstrap checkbox format
        <div className="form-check">
          <input
          className="form-check-input"
          type="checkbox"
          value=""
          id="flexCheckChecked"
          checked
          />
          <label className="form-check-label" htmlFor="flexCheckChecked">
          Checked checkbox
          </label>
        </div> */}
        {errors.dietary && (
          <p className="text-danger">{errors.dietary.message}</p>
        )}
      </div>

      {/* Submit */}
      <button disabled={!isValid} className="btn btn-primary" type="submit">
        Submit
      </button>
    </form>
  );
};

export default DishForm;
