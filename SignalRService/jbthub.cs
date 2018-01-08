using System;
using System.Linq;
using System.Runtime.Remoting.Contexts;
using System.Threading.Tasks;
using Microsoft.AspNet.SignalR;

namespace SignalRService
{
	public class jbthub : Hub
	{
		//++Hub will receive messages from any client here
		//+.....and will Relay all signalr messages from one client to all other clients.
		public async Task NotifyOtherClients(string code, dynamic clientObject)
		{
			//Also send the caller's connectionid
			await Clients.Others.SignalRNotification(code, clientObject, Context.ConnectionId);
		}


		//Client has indicated it wants to send a message to another specific client by id
		public async Task NotifySpecificClient(string clientId, string code, dynamic clientObject)
		{
			//Also send the caller's connectionid
			await Clients.Client(clientId).SignalRNotification(code, clientObject, Context.ConnectionId);
		}



		//++Hub will receive group messages from any client here
		//+.....and will Relay all signalr messages from one client to all other clients in the same group.
		//+The group name will be attached as the last parameter
		public async Task NotifyOtherClientsInGroup(string groupName, string code, dynamic clientObject)
		{

			//Also send the caller's connectionid
			await Clients.OthersInGroup(groupName).SignalRNotification(code, clientObject, Context.ConnectionId, groupName);
		}



        /// <summary>
        ///     If a client disconnects for any reason, signal all of the other clients that they have disconnected.
        ///		The other clients should remove the client from their list of users connected to the hub.
        /// </summary>
        /// <param name="stopCalled" type="bool">
        ///     <para>
        ///         
        ///     </para>
        /// </param>
        /// <returns>
        ///     A System.Threading.Tasks.Task value...
        /// </returns>
        public override async Task OnDisconnected(bool stopCalled)
        {
            //custom logic here

            await Clients.Others.SignalRNotification("System.SignalR.ClientDisconnected", Context.ConnectionId);


            await base.OnDisconnected(stopCalled);
        }

        public override async Task OnConnected()
        {
            //custom logic here

            await Clients.Others.SignalRNotification("System.SignalR.ClientConnected", Context.ConnectionId);


            await base.OnConnected();
        }

        public async Task JoinGroup(string groupName)
		{
			await Groups.Add(Context.ConnectionId, groupName);
		}

		public async Task LeaveGroup(string groupName)
		{

            await Groups.Remove(Context.ConnectionId, groupName);
		}

        

	

	}
}