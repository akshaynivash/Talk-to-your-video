from langgraph.graph import END, StateGraph

from talk_to_your_video.agent.nodes.cypher_tool import run_cypher
from talk_to_your_video.agent.nodes.router import route
from talk_to_your_video.agent.nodes.synthesize import synthesize
from talk_to_your_video.agent.nodes.vector_search_tool import run_vector_search
from talk_to_your_video.agent.state import AgentState


def build_graph():
    graph = StateGraph(AgentState)
    graph.add_node("router", route)
    graph.add_node("cypher_tool", run_cypher)
    graph.add_node("vector_search_tool", run_vector_search)
    graph.add_node("synthesize", synthesize)

    graph.set_entry_point("router")
    graph.add_conditional_edges(
        "router",
        lambda state: state["route"],
        {
            "graph_lookup": "cypher_tool",
            "semantic": "vector_search_tool",
            "hybrid": "cypher_tool",
        },
    )
    graph.add_edge("cypher_tool", "synthesize")
    graph.add_edge("vector_search_tool", "synthesize")
    graph.add_edge("synthesize", END)

    return graph.compile()
