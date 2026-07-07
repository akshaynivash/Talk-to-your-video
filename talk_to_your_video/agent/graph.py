from langgraph.graph import END, StateGraph

from talk_to_your_video.agent.nodes.cypher_tool import run_cypher
from talk_to_your_video.agent.nodes.router import route
from talk_to_your_video.agent.nodes.synthesize import synthesize
from talk_to_your_video.agent.nodes.vector_search_tool import run_vector_search
from talk_to_your_video.agent.state import AgentState


def _select_tools(state: AgentState) -> str | list[str]:
    if state["route"] == "hybrid":
        return ["graph_lookup", "semantic"]
    return state["route"]


def build_graph():
    graph = StateGraph(AgentState)
    graph.add_node("router", route)
    graph.add_node("cypher_tool", run_cypher)
    graph.add_node("vector_search_tool", run_vector_search)
    graph.add_node("synthesize", synthesize)

    graph.set_entry_point("router")
    graph.add_conditional_edges(
        "router",
        _select_tools,
        {
            "graph_lookup": "cypher_tool",
            "semantic": "vector_search_tool",
        },
    )
    graph.add_edge("cypher_tool", "synthesize")
    graph.add_edge("vector_search_tool", "synthesize")
    graph.add_edge("synthesize", END)

    return graph.compile()
