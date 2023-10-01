import { Collection, UUID } from "mongodb";
import { User, FindUserFilter } from "../../types";
import { UsersRepository } from "../../repository";

describe("Unit Testing | UsersRepository", () => {
  const spies = {} as {
    collection: jest.MockedObject<Collection<User>>;
  };
  const sut = {} as { repository: UsersRepository };

  beforeAll(() => {
    spies.collection = {
      insertOne: jest.fn(),
      findOne: jest.fn(),
    } as jest.MockedObject<Collection<User>>;
    sut.repository = new UsersRepository({ collection: spies.collection });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  /*
  describe(`feature: saving new user to database`, () => {
    describe(`scenario: saving is sucessful
        given new user has external id of valid UUID
          and email of "test@test.com"
          and password of "password"
          and created at of valid date
        when i try to save the user to the database`, () => {
      it(`then i should save it`, async () => {
        let newUser: User;
        async function arrange() {
          newUser = {
            external_id: new UUID(),
            email: "test@test.com",
            password: "password",
            created_at: new Date(),
          };
        }
        async function act() {
          try {
            return await sut.repository.create(newUser);
          } catch (error) {
            return error;
          }
        }
        async function assert(actResult: unknown) {
          expect(actResult).toBeUndefined();
        }

        await arrange().then(act).then(assert);
      });
    });
  });
  */

  describe(`feature: finding user`, () => {
    const external_id = new UUID();
    const email = "test@test.com";

    describe.each`
      filter                     | findUserFilter            | expected
      ${"external id"}           | ${{ external_id }}        | ${{ external_id }}
      ${"email"}                 | ${{ email }}              | ${{ email }}
      ${"external id and email"} | ${{ external_id, email }} | ${{ external_id, email }}
    `(
      `scenario: finding by it's $filter is sucessful
        given $filter belongs to user in database
        when i try to find the user`,
      ({
        findUserFilter,
        expected,
      }: {
        findUserFilter: FindUserFilter;
        expected: User;
      }) => {
        it(`then i should find it`, async () => {
          async function arrange() {
            spies.collection.findOne.mockResolvedValueOnce(expected);
          }
          async function act() {
            try {
              return await sut.repository.find(findUserFilter);
            } catch (error) {
              return error;
            }
          }
          async function assert(actResult: unknown) {
            expect(actResult).toStrictEqual(expected);
          }

          await arrange().then(act).then(assert);
        });
      }
    );

    describe.each`
      filter                     | findUserFilter
      ${"external id"}           | ${{ external_id }}
      ${"email"}                 | ${{ email }}
      ${"external id and email"} | ${{ external_id, email }}
    `(
      `scenario: finding by it's $filter results in error
        given $filter doesn't belong to user in database
        when i try to find the user`,
      ({ findUserFilter }: { findUserFilter: FindUserFilter }) => {
        it(`then i should receive the error "User with filters doesn't exist"`, async () => {
          async function arrange() {
            spies.collection.findOne.mockResolvedValueOnce(null);
          }
          async function act() {
            try {
              return await sut.repository.find(findUserFilter);
            } catch (error) {
              return error;
            }
          }
          async function assert(actResult: unknown) {
            expect(actResult).toHaveProperty(
              "message",
              expect.stringMatching("User with filters doesn't exist")
            );
          }

          await arrange().then(act).then(assert);
        });
      }
    );
  });
});
