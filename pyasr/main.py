import logging
from concurrent import futures

from grpc import ServicerContext
from grpc import server as grpc_server

from main_pb2 import transcription_reply, transcription_request
from main_pb2_grpc import MainServicer, add_MainServicer_to_server
from src.whisper import transcribe_audio_base64


class Servicer(MainServicer):
    def transcribe_audio(self, request: transcription_request, context: ServicerContext) -> transcription_reply:
        transcription = transcribe_audio_base64(
            audio_base64=request.audio_base64,
            language=request.language
        )
        return transcription_reply(transcription=transcription)


def serve():
    port = "50051"
    server = grpc_server(futures.ThreadPoolExecutor(max_workers=10))
    add_MainServicer_to_server(Servicer(), server)
    server.add_insecure_port("[::]:" + port)
    server.start()
    print("Server started, listening on " + port)
    server.wait_for_termination()


if __name__ == "__main__":
    logging.basicConfig()
    serve()
