import { collection, addDoc } from "firebase/firestore";
import db from "./firebase";
import CalenderSchedule from "./components/CalenderSchedule";

export default function App() {

  // const writeData = async () => {
  //   try {
  //     const docRef = await addDoc(collection(db, "appointments"), {
  //       name: "John Doe",
  //       time: "10:30 AM",
  //       status: "Available"
  //     });
  //     console.log("Document written with ID: ", docRef.id);
  //   } catch (e) {
  //     console.error("Error adding document: ", e);
  //   }
  // };

  return (
    <>
      <CalenderSchedule />
      {/* <div>
        <button onClick={writeData}>Firestore</button>
      </div> */}
    </>
  );
}
