// LICENSE : MIT
"use strict";
const assert = require("power-assert");
import TodoList from "../../src/domain/TodoList/TodoList";
import { Context, Dispatcher } from "almin";
import TodoItem from "../../src/domain/TodoList/TodoItem";
import TodoStore from "../../src/store/TodoStore/TodoStore";
import TodoState, { FilterTypes } from "../../src/store/TodoStore/TodoState";
import { FilterTodoListUseCase } from "../../src/usecase/FilterTodoList";
import { TodoListRepository } from "../../src/infra/TodoListRepository";
describe("TodoStore", function() {
    it("should return TodoState instance", function() {
        const todoListRepository = new TodoListRepository();
        const store = new TodoStore({ todoListRepository });
        // then
        const todoState = store.getState();
        assert(todoState instanceof TodoState);
    });
    context("when TodoList has todo", function() {
        it("should return todoState that has todo item also", function() {
            const todoList = new TodoList();
            const todoItem = new TodoItem({ title: "Read It Later" });
            todoList.addItem(todoItem);
            const initialState = new TodoState();
            // then
            const todoState = initialState.merge(todoList);
            assert.equal(todoState.items.length, 1);
            const [actualTodoItem] = todoState.items;
            assert.equal(actualTodoItem.title, "Read It Later");
        });
    });
    context("when dispatch events", function() {
        it("should update State", function() {
            const todoList = new TodoList();
            const todoListRepository = new TodoListRepository();
            todoListRepository.save(todoList);
            const store = new TodoStore({ todoListRepository });
            const initialState = store.getState();
            // assert initial state
            assert(initialState.filterType, FilterTypes.ALL_TODOS);
            // when
            const useCase = new FilterTodoListUseCase();
            const context = new Context({
                dispatcher: new Dispatcher(),
                store
            });
            // then
            return context
                .useCase(useCase)
                .execute()
                .then(() => {
                    assert(store.getState().filterType, FilterTypes.COMPLETED_TODOS);
                });
        });
    });
});
