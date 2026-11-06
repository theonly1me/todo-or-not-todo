import { boardSchema, type Board, type Mutation } from "../model";
import { addGroup, deleteGroup, renameGroup } from "./groups";
import { endRace, settleRace, startRace } from "./races";
import { addTodo, deleteTodo, updateTodo } from "./todos";

type ApplyOptions = { board: Board; mutation: Mutation; now: string; id: string };

function reduce(options: ApplyOptions): Board {
  const { board, mutation, now, id } = options;
  switch (mutation.type) {
    case "add-todo": return addTodo({ board, mutation });
    case "update-todo": return updateTodo({ board, mutation, now });
    case "delete-todo": return deleteTodo({ board, mutation });
    case "add-group": return addGroup({ board, mutation });
    case "rename-group": return renameGroup({ board, mutation });
    case "delete-group": return deleteGroup({ board, mutation });
    case "start-race": return startRace({ board, mutation, now, id });
    case "end-race": return endRace({ board });
  }
}

export function applyMutation(options: ApplyOptions): Board {
  return boardSchema.parse(settleRace({ board: reduce(options), now: options.now }));
}
