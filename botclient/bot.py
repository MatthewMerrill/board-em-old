from api import GameRef
from firstchoiceactor import FirstChoiceActor
from randomactor import RandomActor

def main():
    game = GameRef('b871c743-9898-4eac-bbb3-8b2bd5289155')
    actor = RandomActor(game)
    actor.play()

if __name__ == '__main__':
    main()


