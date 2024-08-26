import { useParams } from "react-router-dom";
import axios from "axios";
import { useEffect, useState } from "react";

function Notes(){
    const {userEmail,ind} = useParams();
    const [note, setNote] = useState(null);
    useEffect(() => {
        async function fetchNote() {
        try{
            const responce = await axios.get(`http://localhost:3000/todos/${userEmail}/${ind}`);
            console.log(responce.data);
            setNote(responce.data)
        } catch (err) {
            console.log(err);
        }
    }
    fetchNote();
    }, [])
    
    note && console.log(note);

    return (
        <div>
            <p style={{color: "white"}}>Hello World</p>
            {note && <p style={{color: "white"}}>{note.title}</p>}
        </div>
    )
}

export default Notes;