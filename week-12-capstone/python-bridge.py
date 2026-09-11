import sys
import os
import json
import io
import contextlib
import importlib.util


ROOT = os.path.expanduser("~/Desktop/IDX_Internship")


def load_module(name, path):
    spec = importlib.util.spec_from_file_location(name, path)
    module = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(module)
    return module


def run_recommendation(listing_id):
    path = os.path.join(
        ROOT,
        "week-07-recommendations",
        "recommendation-engine.py"
    )

    module = load_module(
        "recommendation_engine",
        path
    )

    output = io.StringIO()

    with contextlib.redirect_stdout(output):
        module.get_recommendations(listing_id)

    return output.getvalue().strip()


def run_rag(question):
    path = os.path.join(
        ROOT,
        "week-08-rag",
        "rag-pipeline.py"
    )

    module = load_module(
        "rag_pipeline",
        path
    )

    # Week 8 uses relative docs paths,
    # so temporarily run from its folder.
    old_dir = os.getcwd()

    rag_dir = os.path.join(
        ROOT,
        "week-08-rag"
    )

    os.chdir(rag_dir)

    try:
        documents = module.load_documents()
        index = module.index_documents(documents)

        answer = module.rag_answer(
            question,
            index
        )

        return answer

    finally:
        os.chdir(old_dir)


def main():
    if len(sys.argv) < 3:
        print(
            json.dumps({
                "error": "Usage: python-bridge.py <rag|recommend> <input>"
            })
        )
        return

    command = sys.argv[1]
    value = sys.argv[2]

    try:

        if command == "rag":
            result = run_rag(value)

        elif command == "recommend":
            result = run_recommendation(value)

        else:
            raise ValueError(
                f"Unknown command: {command}"
            )

        print(
            json.dumps({
                "ok": True,
                "result": result
            })
        )

    except Exception as error:

        print(
            json.dumps({
                "ok": False,
                "error": str(error)
            })
        )


if __name__ == "__main__":
    main()