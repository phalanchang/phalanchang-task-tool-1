import React from 'react';
import './App.css';
import TaskList from './components/TaskList';
import TaskForm from './components/TaskForm';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>タスク管理アプリ</h1>
      </header>
      <main>
        <TaskForm onSubmit={() => {}} />
        <TaskList tasks={[]} onEdit={() => {}} onDelete={() => {}} onToggleStatus={() => {}} />
      </main>
    </div>
  );
}

export default App;
