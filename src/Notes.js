import React from "react";
import { connect } from "react-redux";
import { Link } from "react-router-dom";
import { deleteNote } from "./store";
import { ConnectedNoteForm } from "./NotesForm";

const Notes = ({ notes, auth, deleteNote }) => {
  console.log("notes", notes);
  // let _notes = "no notes";
  // if (notes.length > 0) {
  //   _notes = notes.map((note) => {
  //     return (
  //       <div key={note.id}>
  //         {note.text} <button onClick={() => deleteNote(note.id)}>x</button>
  //       </div>
  //     );
  //   });
  // }
  //getting an error when all notes are deleted
  return (
    <div>
      <Link to="/home">Home</Link>
      <div>
        {" "}
        {auth.username}'s notes:
        <div>
          {notes.length > 0 ? (
            notes.map((note) => {
              return (
                <div key={note.id}>
                  {note.text}{" "}
                  <button onClick={() => deleteNote(note.id)}>x</button>
                </div>
              );
            })
          ) : (
            <div> no notes </div>
          )}
        </div>
        <ConnectedNoteForm />
      </div>
    </div>
  );
};

const mapState = (state) => state;

const mapDispatch = (dispatch) => {
  return {
    getNotes: () => dispatch(getNotes()),
    deleteNote: (id) => dispatch(deleteNote(id)),
  };
};

export default connect(mapState, mapDispatch)(Notes);
