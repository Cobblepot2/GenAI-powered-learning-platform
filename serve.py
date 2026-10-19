"""Serve the milestone prototype locally with Python's standard library."""
from argparse import ArgumentParser
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


def main():
    parser = ArgumentParser(description="Run the LearnLoop milestone prototype")
    parser.add_argument("--port", type=int, default=5241)
    args = parser.parse_args()
    root = Path(__file__).resolve().parent / "web"
    if not (root / "index.html").is_file():
        parser.error("Missing web/index.html")
    handler = partial(SimpleHTTPRequestHandler, directory=str(root))
    server = ThreadingHTTPServer(("127.0.0.1", args.port), handler)
    print(f"LearnLoop: http://127.0.0.1:{args.port}", flush=True)
    print("Press Ctrl+C to stop.", flush=True)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
