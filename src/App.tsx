import { useState } from "react";
import "./App.css";
import BevFilter from "./components/BevFilter";
import BevForm from "./components/BevForm";
import BevList from "./components/BevList";
import DishFilter from "./components/DishFilter";
import DishForm from "./components/DishForm";
import DishList from "./components/DishList";
import EventForm from "./components/EventForm";
import EventMenu from "./components/EventMenu";
import ExpandableSectionButton from "./components/ExpandableSectionButton";
import ExpandableSectionButtonNewEvent from "./components/ExpandableSectionButtonNewEvent";
import SelectedEventDataDisplay from "./components/SelectedEventDataDisplay";
import SelectedEventTitle from "./components/SelectedEventTitle";
import { emptyEvent } from "./constants/constants";
import {
  EventFormIsExpandedContext,
  SelectedEventContext,
} from "./contexts/contexts";
import { EventDocumentType } from "./interfaces/interfaces";
import EditDeleteEventMenu from "./components/EditDeleteEventMenu";
import EditEventForm from "./components/EditEventForm";

function App() {
  const [eventFormIsExpanded, setEventFormIsExpanded] = useState(false);

  // function setIsExpanded(isExpanded: boolean) {
  //   setEventFormIsExpanded(isExpanded);
  // }

  const [selectedDishCategory, setSelectedDishCategory] = useState("");
  const [selectedBevCategory, setSelectedBevCategory] = useState("");
  // emptyEvent.publicId = "none"
  const [selectedEvent, setSelectedEvent] =
    useState<EventDocumentType>(emptyEvent);
  const [editEventDisplay, setEditEventDisplay] = useState(false);

  return (
    <div className="container">
      <div className="mt-2 mb-2">
        <h1>Events</h1>
      </div>
      <SelectedEventContext.Provider
        value={{ selectedEvent, setSelectedEvent }}
      >
        <EventMenu
          onSelectEvent={(ev) => {
            setSelectedEvent(ev);
            setSelectedDishCategory("");
            setSelectedBevCategory("");
          }}
        />

        <div className="row mb-1">
          <EventFormIsExpandedContext.Provider
            value={{
              eventFormIsExpanded: eventFormIsExpanded,
              setEventFormIsExpanded,
            }}
          >
            <div className="col-sm-12 mb-3">
              <ExpandableSectionButtonNewEvent buttonLabelText="Add Event">
                <EventForm
                  onSubmit={(newEventResult: EventDocumentType) => {
                    setSelectedEvent(newEventResult);
                  }}
                />
              </ExpandableSectionButtonNewEvent>
            </div>
          </EventFormIsExpandedContext.Provider>
        </div>

        {selectedEvent.publicId !== "none" && (
          <>
            <SelectedEventTitle selectedEvent={selectedEvent} />
            {editEventDisplay ? (
              <EditEventForm
                selectedEvent={selectedEvent}
                editEventDisplay={editEventDisplay}
                onSubmit={(newEventResult: EventDocumentType) => {
                  setSelectedEvent(newEventResult);
                  setEditEventDisplay(false);
                }}
                // onCancel={() => setEditEventDisplay(false)}
              />
            ) : (
              <SelectedEventDataDisplay
                selectedEvent={selectedEvent}
                editEventDisplay={editEventDisplay}
              />
            )}

            <EditDeleteEventMenu
              selectedEvent={selectedEvent}
              editEventDisplay={editEventDisplay}
              onClick={() => setEditEventDisplay(!editEventDisplay)}
            />

            <div className="row mb-1">
              <div className="col-sm mb-3">
                <ExpandableSectionButton buttonLabelText="Add Dish">
                  <h2>What Dish?</h2>
                  <DishForm selectedEvent={selectedEvent} />
                </ExpandableSectionButton>
              </div>

              <div className="col-sm mb-3">
                <ExpandableSectionButton buttonLabelText="Add Beverage">
                  <h2>What Beverage?</h2>
                  <BevForm selectedEvent={selectedEvent} />
                </ExpandableSectionButton>
              </div>
              {/* end row */}
            </div>

            <div className="row w-100 mb-1">
              <div className="mb-3">
                <h2>Who's Bringing What?</h2>
                <h3>Dishes</h3>
                <DishFilter
                  selectedDishCategory={selectedDishCategory}
                  onSelectCategory={(category) => {
                    setSelectedDishCategory(category);
                  }}
                />
              </div>
              <div className="mb-3">
                <DishList
                  selectedEvent={selectedEvent}
                  selectedDishCategory={selectedDishCategory}
                />
              </div>

              <div className="mb-3">
                <h3>Beverages</h3>
                <BevFilter
                  selectedBevCategory={selectedBevCategory}
                  onSelectCategory={(category) =>
                    setSelectedBevCategory(category)
                  }
                />
              </div>
              <div className="mb-3">
                <BevList
                  selectedEvent={selectedEvent}
                  selectedBevCategory={selectedBevCategory}
                />
              </div>
              {/* end row */}
            </div>
          </>
        )}
      </SelectedEventContext.Provider>
      {/* end container */}
    </div>
  );
}

export default App;
