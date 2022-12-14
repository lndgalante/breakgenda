import dayjs from 'dayjs';
import Head from 'next/head';
import { useState } from 'react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import { Avatar, Box, Button, Heading, HStack, Link, Select, Stack, Text } from '@chakra-ui/react';

import sessionsRawData from '../public/sessions.json';
import speakersRawData from '../public/speakers.json';

dayjs.extend(isSameOrBefore);

const speakersById = speakersRawData.reduce(
  (accumulator, speaker) => ({
    ...accumulator,
    [speaker.id]: speaker,
  }),
  {},
);

const sessionsByLocationIds = sessionsRawData.sessions.reduce((accumulator, session) => {
  const { locationId, startDate, endDate, startMinute, endMinute, speakers: sessionSpeakers } = session;
  /*
  const date1 = dayjs(startMinute);
  date1.diff(endMinute, 'hour'); // 7

  console.log('time', date1.format('H[:]m'));

  const hour = dayjs(startDate + startMinute).format('H[:]m');
  console.log('\n ~ sessionsByLocationIds ~ hour', hour);
  // const startMinuteTime = dayjs(startDate).from(startMinute) */

  const parsedSession = {
    ...session,
    startCompareDate: startDate + startMinute * 60000,
    day: `${dayjs(startDate).format('dddd[,] MMMM D')}`,
    // time: `${dayjs(startDate).add}`,
    time: `${dayjs(startDate + startMinute * 60000).format('h[:]mm')} - ${dayjs(startDate + endMinute * 60000).format(
      'h[:]mm',
    )}`,
    speakers: sessionSpeakers.map((sessionSpeaker) => speakersById[sessionSpeaker.speakerId]).filter(Boolean),
  };

  return {
    ...accumulator,
    [locationId]: [...(accumulator[locationId] ?? []), parsedSession],
  };
}, {});

const locationIdToLocationName = {
  54245: {
    name: '🏛 Carlos Lopes Pavilion',
    location:
      'https://www.google.com/maps/place/Carlos+Lopes+Pavillion/@38.728949,-9.1517438,15z/data=!4m2!3m1!1s0x0:0x20602ac61a767295?sa=X&ved=2ahUKEwi0nofLjpf7AhVelJUCHaGxCBgQ_BJ6BAhLEAU',
  },
  54246: {
    name: '🧠 Convento do Beato',
    location:
      'https://www.google.com/maps/place/Convento+do+Beato/@38.7348512,-9.1062672,15z/data=!4m2!3m1!1s0x0:0x1ab47681c49d3234?sa=X&ved=2ahUKEwjj38_fjpf7AhVvrJUCHSJhDhMQ_BJ6BAhtEAU',
  },
  54247: {
    name: '💻 Pateo da Galé',
    location:
      'https://www.google.com/maps/place/Gale+patio/@38.7078904,-9.1383932,15z/data=!4m2!3m1!1s0x0:0x565afd189c874962?sa=X&ved=2ahUKEwi2qoWCj5f7AhU7rZUCHdzKClIQ_BJ6BAhtEAU',
  },
  54248: {
    name: '🎙 Teatro Capitólio',
    location:
      'https://www.google.com/maps/place/Cineteatro+Capit%C3%B3lio/@38.7188644,-9.146635,15z/data=!4m2!3m1!1s0x0:0x4ffd6f3d5b082f50?sa=X&ved=2ahUKEwjn2L-Uj5f7AhX9p5UCHUruCmUQ_BJ6BAh1EAU',
  },
};

const locationIds = Object.keys(locationIdToLocationName).map(Number);

const days = [1667606400000, 1667692800000];

// TODO: Friday 7 is missing

export default function Home() {
  // react hooks
  const [selectedSessions, setSelectedSessions] = useState([]);
  const [selectedLocationIds, setSelectedLocationIds] = useState(locationIds);
  const [selectedDateTimestamp, setSelectedDateTimestamp] = useState(days[0]);

  // handlers
  function handleSelectedDate({ target }) {
    const selectedDateTimestamp = target.value as string;
    setSelectedDateTimestamp(Number(selectedDateTimestamp));
  }

  function handleSelectedLocationId(locationId: number) {
    setSelectedLocationIds((previousSelectedLocationIds) => {
      const set = new Set(previousSelectedLocationIds);
      set.has(locationId) ? set.delete(locationId) : set.add(locationId);

      return Array.from(set);
    });
  }

  function handleSelectSession(session) {
    console.log('\n ~ handleSelectSession ~ session', session);
    const { id: sessionId } = session;
    const selectedSessionsIds = selectedSessions.map((session) => session.id);

    if (selectedSessionsIds.includes(sessionId)) {
      const filteredSelectedSessions = selectedSessions.filter((session) => sessionId !== session.id);
      setSelectedSessions(filteredSelectedSessions);
    } else {
      setSelectedSessions((previousSelectedSessions) => [...previousSelectedSessions, session]);
    }
  }

  // constants
  const filteredSessions = Object.entries(sessionsByLocationIds)
    .filter(([locationId]) => selectedLocationIds.includes(Number(locationId)))
    .map(([locationId, sessions]) => [
      locationId,
      sessions.filter((session) => session.startDate === selectedDateTimestamp),
    ])
    .filter(([, sessions]) => sessions.length > 0);

  return (
    <Stack minHeight='100vh' paddingBottom='240px'>
      <Head>
        <title>Breakgenda 2022</title>
        <meta name='description' content='Generated by create next app' />
        <link rel='icon' href='/favicon.ico' />
      </Head>

      <Stack as='main' paddingX={4} paddingY={2} spacing={4}>
        <Stack as='header'>
          <Heading as='h1' size='xl'>
            Breakgenda 2022
          </Heading>
        </Stack>

        <HStack as='nav' spacing={6} paddingBottom={4}>
          <Stack>
            <Text fontWeight={600}>Filter by date</Text>
            <Select variant='filled' color='gray.900' onChange={handleSelectedDate} value={selectedDateTimestamp}>
              {days.map((day) => (
                <option key={day} value={day}>
                  {dayjs(day).format('dddd[,] MMM D')}
                </option>
              ))}
            </Select>
          </Stack>
          <Stack>
            <Text fontWeight={600}>Filter by location</Text>
            <HStack>
              {Object.entries(locationIdToLocationName).map(([locationId, locationData]) => (
                <Button
                  size='md'
                  colorScheme='purple'
                  onClick={() => handleSelectedLocationId(Number(locationId))}
                  variant={selectedLocationIds.includes(Number(locationId)) ? 'solid' : 'outline'}
                  key={locationId}
                >
                  {locationData.name}
                </Button>
              ))}
            </HStack>
          </Stack>
        </HStack>

        <HStack as='section' alignItems='flex-start'>
          {filteredSessions.map(([locationId, sessions]) => (
            <Stack as='article' key={locationId}>
              <Link fontSize='lg' href={locationIdToLocationName[locationId].location} isExternal>
                {locationIdToLocationName[locationId].name} <ExternalLinkIcon mx='2px' paddingBottom='3px' />
              </Link>
              {sessions.map((session) => (
                <Stack
                  key={session.id}
                  padding={2}
                  border='1px'
                  minHeight='180px'
                  borderColor='purple.400'
                  borderRadius='md'
                  backgroundColor='purple.50'
                  cursor='pointer'
                  spacing={3}
                  onClick={() => handleSelectSession(session)}
                >
                  <Text fontSize='lg' fontWeight={500}>
                    {session.title}
                  </Text>

                  <Stack spacing={0}>
                    <Text>{session.day}</Text>
                    <Text>{session.time}</Text>
                  </Stack>

                  <Stack>
                    {session.speakers.map((speaker) => (
                      <HStack key={`${session.id}-${speaker?.personId}`}>
                        <Avatar
                          size='md'
                          name={`${speaker?.firstname} ${speaker?.lastname}`}
                          src={speaker.thumbnailUrl}
                          borderWidth={2}
                          borderColor='purple.600'
                        />
                        <Stack spacing={0}>
                          <Text fontSize='xs'>{`${speaker?.firstname} ${speaker?.lastname}`}</Text>
                          <Text fontSize='xs'>{speaker.title}</Text>
                          <Text fontSize='xs'>{speaker.company}</Text>
                        </Stack>
                      </HStack>
                    ))}
                  </Stack>
                </Stack>
              ))}
            </Stack>
          ))}
        </HStack>

        <Stack
          as='footer'
          position='fixed'
          bottom={0}
          left={0}
          right={0}
          padding={2}
          height='220px'
          color='white'
          backgroundColor='gray.800'
        >
          <Text fontWeight={600}>Click on sessions to create your agenda</Text>
          <Box
            display='flex'
            flex={1}
            flexDirection='column'
            overflowX='auto'
            flexWrap='wrap'
            alignContent='flex-start'
          >
            {selectedSessions.map((session) => (
              <Stack
                key={`session-${session.id}`}
                width={290}
                padding={2}
                margin={1}
                border='1px'
                borderColor='purple.400'
                borderRadius='md'
                backgroundColor='purple.400'
                cursor='pointer'
                spacing={3}
                onClick={() => handleSelectSession(session)}
              >
                <Stack spacing={0}>
                  <Text fontSize='md' fontWeight={500} noOfLines={1}>
                    {session.title}
                  </Text>
                  <Text>{locationIdToLocationName[session.locationId].name}</Text>
                </Stack>

                <Stack spacing={0}>
                  <Text>{session.day}</Text>
                  <Text>{session.time}</Text>
                </Stack>

                <Text noOfLines={1}>
                  {session.speakers.map((speaker) => `${speaker?.firstname} ${speaker?.lastname}`).join(', ')}
                </Text>
              </Stack>
            ))}
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
}
