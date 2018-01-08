using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Data;
using System.Data.SqlTypes;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Samples.SqlServer;
using Microsoft.AspNet.SignalR.Client;
using Microsoft.SqlServer.Server;
using ConnectionState = Microsoft.AspNet.SignalR.Client.ConnectionState;


namespace SignalRDatabaseTransmitter
{
    class Program
    {
        static void Main(string[] args)
        {

           
            for (;;)
            {
                try
                {
                    using (var db = new iOPS_NormalizedEntities())
                    {
                        //Console.WriteLine("Opening data set");
                        var messages = db.HarvestSignalRMessageQueue().ToList();
                        //Console.WriteLine("Dataset Size = " + messages.Count.ToString());
                        foreach (var signalRMessageQueue in messages)
                        {
                            var queueLength = SignalR.EnqueueMessage(signalRMessageQueue.GroupCode, signalRMessageQueue.Code, signalRMessageQueue.Message);
                            //Console.WriteLine(queueLength);
                        }

                    }
                    Task.Delay(10);

                }
                catch (Exception e)
                {
                    Console.WriteLine(e);
                }
            }





        }
    }

    public static class SignalR
    {
        private static readonly string HubUrl = "https://www.iopspro.com/DataServices/SignalR";
        private const int CONNECTIONCOUNT = 500;
        private static readonly SignalRClient[] Clients = new SignalRClient[CONNECTIONCOUNT];

        private static int DistributionCounter = 0;
        private static readonly object _lock = new object();
        private static int CreatedClientCount = 0;
        private static readonly ConcurrentQueue<Message> MessageQueue = new ConcurrentQueue<Message>();
        private static readonly ConcurrentBag<ActivityLogEntry> ActivityLog = new ConcurrentBag<ActivityLogEntry>();

        static SignalR()
        {

            // Step 1. Create configuration object 
            //var config = new LoggingConfiguration();
            //var fileTarget = new FileTarget();
            //config.AddTarget("file", fileTarget);

            // Step 3. Set target properties 
            //fileTarget.FileName = "${basedir}/${shortdate}.log";
            //fileTarget.Layout = @"${date:format=HH\:mm\:ss.fff} ${message}";

            //var rule = new LoggingRule("*", LogLevel.Debug, fileTarget);
            //config.LoggingRules.Add(rule);
            //LogManager.Configuration = config;

            //logger = LogManager.GetLogger("Trace");
            //logger.Debug("CLR Starting");

            //This will block until at least one connection is available
            InitializeClients();

            //Start four threads that processes messages off of the queue and tries to send them.
            Task.Factory.StartNew(() =>
            {
                Message message;
                for (;;)
                {
                    while (MessageQueue.TryDequeue(out message))
                    {
                        SendSignalRMessage(message);
                    }
                    Thread.Sleep(1);
                }
            });

            Task.Factory.StartNew(() =>
            {
                Message message;
                for (;;)
                {
                    while (MessageQueue.TryDequeue(out message))
                    {
                        SendSignalRMessage(message);
                    }
                    Thread.Sleep(1);
                }
            });

            Task.Factory.StartNew(() =>
            {
                Message message;
                for (;;)
                {
                    while (MessageQueue.TryDequeue(out message))
                    {
                        SendSignalRMessage(message);
                    }
                    Thread.Sleep(1);
                }
            });

            Task.Factory.StartNew(() =>
            {
                Message message;
                for (;;)
                {
                    while (MessageQueue.TryDequeue(out message))
                    {
                        SendSignalRMessage(message);
                    }
                    Thread.Sleep(1);
                }
            });

        }

       

        private static void InitializeClients()
        {
            //Create the first client and schedule the rest of the client creations in the background on a different thread.
            CreatedClientCount = 0;
            DistributionCounter = 0;
            //logger.Debug("InitializeClients() - Creating first client connection in blocking mode");

            Clients[0] = CreateConnection(0);
            CreatedClientCount++;

            Task.Factory.StartNew(() =>
            {
                for (int c = 0; c < CONNECTIONCOUNT; c++)
                {
                    var client = CreateConnection(c);

                    lock (_lock)
                    {
                        Clients[c] = client;
                        CreatedClientCount++;
                    }
                };

            });
        }


        private static void LogMessage(string message)
        {
            ActivityLog.Add(new ActivityLogEntry
            {
                LogDate = DateTime.Now,
                Message = message
            });
        }

        private static SignalRClient CreateConnection(int connectionNumber)
        {
            Console.WriteLine("CreateConnection() - Creating Client[" + connectionNumber + "]");

            var client = new SignalRClient
            {
                Connection = new HubConnection(HubUrl),
                Faulted = false,
                ConnectionNumber = connectionNumber,
                ConnectionInProgress = true,
                IsAvailable = false
            };

            client.Connection.DeadlockErrorTimeout = TimeSpan.FromSeconds(120);

            //Create a hub proxy set for this connection
            client.HubProxy = client.Connection.CreateHubProxy("jbthub");

            //Start the connection and wait for it to finish connection (block on this step)
            Console.WriteLine("CreateConnection() - Starting connection for Client[" + connectionNumber + "]");

            client.Connection.Start().ContinueWith((t) => //The continue with is so that we can set client.ConnectionInProgress = fasle after the connection open succeeds.
            {
                client.ConnectionInProgress = false;
                Console.WriteLine("CreateConnection() - Started connection for Client[" + connectionNumber + "]");
            }).Wait();

            if (client.Connection.State != ConnectionState.Connected)
            {
                //There is some sort of issue with SignalR hub, just return an object with the error flag set.
                Console.WriteLine("CreateConnection() - Client[" + connectionNumber + "] Did not connect - Faulted - returning null client");

                client.Faulted = true;
                return null;
            }

            Console.WriteLine("CreateConnection() - Connection established for Client[" + connectionNumber + "] returning a connected client");
            return client;
        }

        private static SignalRClient GetNextAvailableClient()
        {
            //logger.Debug("GetNextAvailableClient() - started. Current Distribution Counter = " + DistributionCounter);
            object _lock = new object();
            int currentDistributionCounter;

            lock (_lock)
            {
                currentDistributionCounter = DistributionCounter++;
                if (DistributionCounter >= CreatedClientCount - 1)
                {
                    DistributionCounter = 0;
                }

            }

            if (Clients[currentDistributionCounter].Connection.State == ConnectionState.Connected)
            {

                //logger.Debug("GetNextAvailableClient() - started. Current Distribution Counter = " + DistributionCounter);
                var client = Clients[currentDistributionCounter];
                while (client.MessageInProgress)
                {
                    Thread.Sleep(1);
                }
                return client; //Normal operations - all clients actively connected.
            }

            Console.WriteLine("Connection was not connected");

            //The current client is not connected for some reason.
            //Create a new connection in its place and go to the next one.
            try
            {
                Clients[currentDistributionCounter].Connection.Stop();
            }
            catch (Exception)
            {

                //throw;
            }

            Clients[currentDistributionCounter] = CreateConnection(currentDistributionCounter);

            if (Clients[currentDistributionCounter].Connection.State == ConnectionState.Connected)
            {
                var client = Clients[currentDistributionCounter];
                return client;
            } else
            {
                return null;
            }


        }

        private static bool SendSignalRMessage(Message message)
        {
            var success = false;

            var client = GetNextAvailableClient();

            //Keep trying until we get at least one client connected
            while(client == null)
            {
                Thread.Sleep(100);
                client = GetNextAvailableClient();
            }

            client.MessageInProgress = true;
            client.HubProxy.Invoke<string>("NotifyOtherClientsInGroup", message.GroupName, message.Code, "Conn=" + DistributionCounter.ToString() + "," + message.MessageText).ContinueWith((t) =>
            {
                client.MessageInProgress = false;
                Console.WriteLine("Message sent on Client " + client.ConnectionNumber);
            });

            return success;

        }


        public static int EnqueueMessage(string groupName, string code, string message)
        {

            //Place the message in the concurrent queue
            MessageQueue.Enqueue(new Message
            {
                GroupName = groupName,
                Code = code,
                MessageText = message
            });


            return MessageQueue.Count;

        }

        private class Message
        {
            public string GroupName { get; set; }
            public string Code { get; set; }
            public string MessageText { get; set; }
        }

        private class SignalRClient
        {
            public int ConnectionNumber { get; set; }
            public HubConnection Connection { get; set; }
            public IHubProxy HubProxy { get; set; }
            public Boolean Faulted { get; set; }

            public Boolean IsAvailable { get; set; }

            public bool ConnectionInProgress { get; set; }

            public bool MessageInProgress { get; set; }
        }


        private class ActivityLogEntry
        {
            public DateTime LogDate { get; set; }
            public string Message { get; set; }
        }

    }
}
