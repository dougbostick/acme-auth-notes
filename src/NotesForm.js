import React from "react";
import { connect } from "react-redux";
import { addNote } from "./store";

class NoteForm extends React.Component {
  constructor() {
    super();
    this.state = {
      text: "",
    };
    this.create = this.create.bind(this);
  }

  async create(ev) {
    ev.preventDefault();
    this.props.addNote(this.state.text);
    this.setState({ text: "" });
  }

  render() {
    const { text } = this.state;
    return (
      <form onSubmit={this.create}>
        <input
          placeholder="input note"
          value={text}
          onChange={(ev) => this.setState({ text: ev.target.value })}
        />
        <button>Submit</button>
      </form>
    );
  }
}

const mapDispatch = (dispatch) => {
  return {
    addNote: (text) => dispatch(addNote(text)),
  };
};

export const ConnectedNoteForm = connect(null, mapDispatch)(NoteForm);
