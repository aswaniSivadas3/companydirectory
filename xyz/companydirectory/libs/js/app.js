// Global Variables
var currentLocations = [];
var currentDepartments = [];

let firstName_toggle = true;
let lastName_toggle = true;
let email_toggle = true;
let jobTitle_toggle = true;
let department_toggle = true;
let location_toggle = true;

// Main AJAX & jQuery Code
$(function(){

    getAllUsers();
   // 
    // --------------------------------------------------------- Users ---------------------------------------------------------
    // User Modal Behaviour
    $('.tableRow').click(function() {

        var current_user;
        current_user = this.id
        console.log(current_user)

        $("#userSelectModal").modal('show'); 

        // Generate specific user details
        $.ajax({
            type: 'GET',
            url: "../companydirectory/libs/php/getPersonnelByID.php",
            data: {
                id: current_user
            },
            dataType: 'json',
            async: false,
            success: function(results) {

                const data = results["data"]
                const returned_user = data.personnel['0'];
                
                $('#userSelectModalLabel').html(`${returned_user.firstName} ${returned_user.lastName}`);
                $('#user_id').val(returned_user.id);
                $('#user_firstName').val(returned_user.firstName);
                $('#user_lastName').val(returned_user.lastName);
                $('#user_email').val(returned_user.email);
                $('#user_jobTitle').val(returned_user.jobTitle);
                $('#user_department').val(returned_user.department);
                $('#user_location').val(returned_user.location);
                $("#edit").attr("userID", returned_user.id);

            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        });
        
        // Delete User
        $("#delete").click(function(){      
            
            $("#userDeleteModal").modal('show');      
            $('#deleteConfirm').html(`${$('#userSelectModalLabel').html()}<br>`);
          
            $(`#delUserConfirm`).on('click', event => {
                var userID = $('#user_id').val();
               
                $.ajax({
                    type: 'POST',
                    url: "./libs/php/deleteUserByID.php",
                    data: {
                        id: userID,
                    },
                    dataType: 'json',
                    async: false,
                    success: function(results) {
                    getAllUsers();   
                    },
            
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(errorThrown);
                    }
                    
                }) 
            })
        });

    })

    // Edit User
    $("#edit").click(function(){      

        $("#userEditModal").modal('show'); 
        $('.modal-backdrop').show(); // Show the grey overlay.

        // Generate specific user details
        $.ajax({
            type: 'GET',
            url: "../companydirectory/libs/php/getPersonnelByID.php",
            data: {
                id: $("#edit").attr("userID")
            },
            dataType: 'json',
            async: false,
            success: function(results) {

                const data = results["data"]
                const returned_user = data.personnel['0'];
                
                $('#edit_user_firstName').val(returned_user.firstName);
                $('#edit_user_lastName').val(returned_user.lastName);
                $('#edit_user_email').val(returned_user.email);
                $('#edit_user_jobTitle').val(returned_user.jobTitle);
                $('#edit_user_department').html(returned_user.department);
                $('#edit_user_location').html(returned_user.location);
                $("#editUserConfirm").attr("userID", returned_user.id);


            },
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        })

        getDepartmentsByUser();

        let departmentSelection = "";
        for(i=0; i<currentDepartments.length; i++){
            if(currentDepartments[i].department == $('#edit_user_department').html()){
                departmentSelection += `<option value="${currentDepartments[i].id}" selected="selected">${currentDepartments[i].department}</option>`
            } else {
                departmentSelection += `<option value="${currentDepartments[i].id}">${currentDepartments[i].department}</option>`
            }                
        }

        $('#edit_user_department').html(departmentSelection);

        $("#edit_user_department").change(function(){
            
            let locationSelectionHTML = "";
            let locationID = document.getElementById('edit_user_department').value;
            
            for(let i=0; i < currentDepartments.length; i++){
                if (currentDepartments[i]['id'] == locationID){
                    locationSelectionHTML = `${currentDepartments[i]['location']}`
                }
            }
            
            $('#edit_user_location').html(locationSelectionHTML);
        })
    
    });

    // Confirm Edit User -> PHP Routine
    $("#editUserForm").submit(function(e) {

        // e.preventDefault();
        // e.stopPropagation();

        $.ajax({
            type: 'POST',
            url: "../companydirectory/libs/php/updateUser.php",
            data: {
                firstName: $('#edit_user_firstName').val(),
                lastName: $('#edit_user_lastName').val(),
                email: $('#edit_user_email').val(),
                jobTitle: $('#edit_user_jobTitle').val(),
                departmentID: $('#edit_user_department').val(),
                id: $("#editUserConfirm").attr("userID")
            },
            dataType: 'json',
            async: false,
            success: function(results) {
               
                getAllUsers();
                

            },

            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        }) 
        
    });


    // Add User Modal
    $(`#addUser`).on('click', event => {
        
        $('.modal-backdrop').show(); // Show the grey overlay.

        getDepartmentsByUser();
        let departmentSelection = ``;

        for(i=0; i<currentDepartments.length; i++){
            departmentSelection += `<option value="${currentDepartments[i].id}">${currentDepartments[i].department}</option>`
        }

        $('#add_user_department').html(departmentSelection);

        function updateLocation(){
            let locationSelectionHTML = "";
            let locationID = document.getElementById('add_user_department').value;
            
            for(let i=0; i < currentDepartments.length; i++){
                if (currentDepartments[i]['id'] == locationID){
                    locationSelectionHTML = `${currentDepartments[i]['location']}`
                }
            }
            
            $('#add_user_location').html(locationSelectionHTML);
        }

        updateLocation();

        $("#add_user_department").change(function(){
            updateLocation();
        })

    });

    // Confirm Add User -> PHP Routine
    $("#newUserForm").submit(function(e) {

        e.preventDefault();
       // e.stopPropagation();

        $.ajax({
            type: 'POST',
            url: "../companydirectory/libs/php/insertUser.php",
            data: {
                firstName: $('#add_user_firstName').val(),
                lastName: $('#add_user_lastName').val(),
                email: $('#add_user_email').val(),
                jobTitle: $('#add_user_jobTitle').val(),
                departmentID: $('#add_user_department').val()
            },
            dataType: 'json',
            async: false,
            success: function(results) {                
                getAllUsers();
                window.navigate("index.html");
               
            },

            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        })
    });


    // --------------------------------------------------------- Departments ---------------------------------------------------------

    // Department Modal Behaviour
    var deptToDeleteName;
    var deptToDeleteId;
    $("#departments").on('click', event => {
      

        $('.modal-backdrop').show(); // Show the grey overlay.
        generateDepartmentList();

        $("#addDepartment").click(function(){      
            
            document.getElementById('newDepName').value = "";
            getLocations();

            let locationSelection = "";
            for(i=0; i<currentLocations.length; i++){
                locationSelection += `<option value="${currentLocations[i].id}">${currentLocations[i].location}</option>`
            }

            $('#newDepLocation').html(locationSelection);

        });

        // Edit Department       
        $('.depTableRow').click(function(){
            
            $('.modal-backdrop').show(); // Show the grey overlay.

            $('#editDepName').val(`${this.title}`);
            $('#editDepForm').attr("depID", `${this.attributes.departmentID.value}`);
            
             deptToDeleteName=this.title;
             deptToDeleteId=this.id;
            var locID = this.attributes.location.value;
            departmentId=this.attributes.departmentID.value;

            // if (this.attributes.users.value == 0){
            //     $("#deleteDepBtn").show();
                 $("#departmentDelete").attr("departmentName",this.attributes.title.value);
                 $("#departmentDelete").attr("departmentID",this.attributes.departmentID.value);
            // } else {
            //     //$("#deleteDepBtn").hide();
            // }

            getLocations();
            let locationSelection = "";
            for(i=0; i<currentLocations.length; i++){
                
                if(currentLocations[i].id == locID){
                    locationSelection += `<option value="${currentLocations[i].id}" selected="selected">${currentLocations[i].location}</option>`
                }
                else {
                    locationSelection += `<option value="${currentLocations[i].id}">${currentLocations[i].location}</option>`
                }
            }

            $('#editDepLocation').html(locationSelection);

        });

        // Confirm Edit Department -> PHP Routine
        $("#editDepForm").submit(function(e) {

            e.preventDefault();
            e.stopPropagation();
            $('#editDepId').val(this.attributes.depID.value);
            console.log($('#editDepId').val())
            $.ajax({
                type: 'POST',
                url: "../companydirectory/libs/php/updateDepartment.php",
                data: {
                    name: $('#editDepName').val(),
                    locationID: $('#editDepLocation').val(),
                    departmentID: this.attributes.depID.value
                },
                dataType: 'json',
                async: false,
                success: function(results) {
                    deptToDeleteId=null;
                   
                },
        
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            }) 
    
        })

        // Delete Department
        $("#departmentDelete").click(function(){      
    
            $('.modal-backdrop').show(); // Show the grey overlay.
            $('#delDepName').html($('#editDepName').val());
            // $('#delDepName').html($('#editDepId').val());
            // console.log($('#editDepId').val());
            $.ajax({
                type: 'POST',
                url: "../companydirectory/libs/php/checkPersonelInDepartment.php",
                
                data: {
                    departmentID: deptToDeleteId
                },
                dataType: 'json',
                async: false,
                success: function(results) {
                    console.log(results);
                    if (results.data[0].departmentCount == 0) {  
                        $("#departmentDeleteModal").modal("show");
                        
                    }
                    else{
                       
                        $("#cantDeleteDeptName").text(results.data[0].departmentName);
                        $("#empCount").text(results.data[0].departmentCount);
                        //deptToDeleteId=null;
                        $("#cantDeleteDepartmentModal").modal("show");
                    }
                },
        
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            }) 
            


            $("#deleteDeptForm").submit(function(){ 
                var depIDInt = parseInt(deptToDeleteId)
                
                $.ajax({
                    type: 'POST',
                    url: "../companydirectory/libs/php/deleteDepartmentByID.php",
                    data: {
                        id: depIDInt,
                    },
                    dataType: 'json',
                    async: false,
                    success: function(results) {
                        deptToDeleteId=null;
                    },
            
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(errorThrown);
                    }
                })
                
            })
        });

    });    

    // Add Department -> PHP Routine
    $("#addDepForm").submit(function(e) {

        e.preventDefault();
        e.stopPropagation();

        $.ajax({
            type: 'POST',
            url: "../companydirectory/libs/php/insertDepartment.php",
            data: {
                name: $('#newDepName').val(),
                locationID: $('#newDepLocation').val()
            },
            dataType: 'json',
            async: false,
            success: function(results) {
                
            },

            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        })

    })


    // --------------------------------------------------------- Locations ---------------------------------------------------------
    var locId;
    // Location Modal Behaviour
    $(`#locations`).on('click', event => {

        // Generate the html table with locations list 
        ViewLocationTable();   


        // Edit Location Modal
        $(".locationEdit").click(function(){      
            
            $('.modal-backdrop').show();

            $('#edit_location_name').val(this.attributes.locationName.value);
            $('#edit_location_name').attr("locID", this.attributes.locationID.value);
            locId=this.attributes.locationID.value;
            if (this.attributes.departments.value == 0){
                $("#deleteLocBtn").show();
                $("#locationDelete").attr("locationName",this.attributes.locationName.value);
                $("#locationDelete").attr("locationID",this.attributes.locationID.value);
            } else {
                // $("#deleteLocBtn").hide();
            }
        
        });

        // Delete Location -> PHP Routine
        $("#locationDelete").click(function(){
            
            //$('#delLocName').html(`${this['attributes']['locationName']['value']}`);
            $('#delLocName').html($("#edit_location_name").val());
            var locID=locId;

            $.ajax({
                type: 'POST',
                url: "../companydirectory/libs/php/checkDepartmentInLocation.php",
                
                data: {
                    locationID: locId,
                },
                dataType: 'json',
                async: false,
                success: function(results) {
                    console.log(results);
                    if (results.data[0].locationCount == 0) {          
                        $("#locationDeleteModal").modal("show");
                       
                    }
                    else{
                        $("#cantDeleteLocationName").text(results.data[0].locationName);
                        $("#pc").text(results.data[0].locationCount);
                        $("#cantDeleteLocationModal").modal("show");
                    }
                },
        
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            }) 
            
            $("#delLocForm").submit(function(e) {

                e.preventDefault();
                e.stopPropagation();

                $.ajax({
                    type: 'POST',
                    url: "../companydirectory/libs/php/deleteLocationByID.php",
                    //url: "../companydirectory/libs/php/checkPersonnelInLocation.php",
                    
                    data: {
                        locationID: locId,
                    },
                    dataType: 'json',
                    async: false,
                    success: function(results) {
                        // console.log(results);
                        // $("#cantDeleteLocationName").text(results.data[0].locationName);
                        // $("#pc").text(results.data[0].locationCount);
                        // $("#cantDeleteLocationModal").modal("show");
                    },
            
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(errorThrown);
                    }
                }) 
            })
        });
    });    

    // Edit Location -> PHP Routine
    $("#editLocForm").submit(function(e) {

        e.preventDefault();
        e.stopPropagation();
        
        $.ajax({
            type: 'POST',
            url: "../companydirectory/libs/php/updateLocation.php",
            data: {
                name: $('#edit_location_name').val(),
                locationID: $('#edit_location_name').attr("locID"),
            },
            dataType: 'json',
            async: false,
            success: function(results) {
                
            },
    
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        }) 
    })

    // Add Location - Modal
    $("#addLocation").click(function(){
        $('.modal-backdrop').show();
        $('#newLocName').val("");
    })

    // Add Location -> PHP Routine
    $("#addLocForm").submit(function(e) {

        e.preventDefault();
        e.stopPropagation();

        $.ajax({
            type: 'POST',
            url: "../companydirectory/libs/php/insertLocation.php",
            data: {
                name: $('#newLocName').val(),
            },
            dataType: 'json',
            async: false,
            success: function(results) {
                
            },
    
            error: function(jqXHR, textStatus, errorThrown) {
                console.log(errorThrown);
            }
        })

    })


    // --------------------------------------------------------- Search Functions ---------------------------------------------------------
    // TRY AND GET THIS ALL INTO A FUNCTION! Note: Have tried putting all this code into functions, however it just won't work :( ... To retry!

    // Search Functionality
    $("#search").click(function(){
        
        $("#resetBtn").attr("style", "visibility: visible");
        var option = $('#searchSelect').val();
        
        if(option == 'firstName'){
            $.ajax({
                type: 'GET',
                url: "../companydirectory/libs/php/search_firstName.php",
                data: {
                    search: "%" + document.getElementById("searchField").value + "%"
                },
                dataType: 'json',
                async: false,
                success: function(results) {
                    generateSearchResultsUsers(results);
                },
        
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            })
        } else if (option == 'lastName'){
            $.ajax({
                type: 'GET',
                url: "../companydirectory/libs/php/search_lastName.php",
                data: {
                    search: "%" + document.getElementById("searchField").value + "%"
                },
                dataType: 'json',
                async: false,
                success: function(results) {
                    generateSearchResultsUsers(results);
                },
        
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            })
        } else if (option == 'email'){
                $.ajax({
                    type: 'GET',
                    url: "../companydirectory/libs/php/search_email.php",
                    data: {
                        search: "%" + document.getElementById("searchField").value + "%"
                    },
                    dataType: 'json',
                    async: false,
                    success: function(results) {
                        generateSearchResultsUsers(results);
                    },
            
                    error: function(jqXHR, textStatus, errorThrown) {
                        console.log(errorThrown);
                    }
                })
        } else if (option == 'jobTitle'){
            $.ajax({
                type: 'GET',
                url: "../companydirectory/libs/php/search_jobTitle.php",
                data: {
                    search: "%" + document.getElementById("searchField").value + "%"
                },
                dataType: 'json',
                async: false,
                success: function(results) {
                    generateSearchResultsUsers(results);
                },
        
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            })
        } else if (option == 'department'){
            $.ajax({
                type: 'GET',
                url: "../companydirectory/libs/php/search_department.php",
                data: {
                    search: "%" + document.getElementById("searchField").value + "%"
                },
                dataType: 'json',
                async: false,
                success: function(results) {
                    generateSearchResultsUsers(results);
                },
        
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            })
        } else if (option == 'location'){
            $.ajax({
                type: 'GET',
                url: "../companydirectory/libs/php/search_location.php",
                data: {
                    search: "%" + document.getElementById("searchField").value + "%"
                },
                dataType: 'json',
                async: false,
                success: function(results) {
                    generateSearchResultsUsers(results);
                },
        
                error: function(jqXHR, textStatus, errorThrown) {
                    console.log(errorThrown);
                }
            })
        }
    })

    // Reset button functionalit
    $("#resetBtn").on('click', () => {
        $("#resetBtn").attr("style", "visibility: hidden");
        $("#searchField").val("");
        getAllUsers();        
    }) 

    // Dynamic behaviour for searchBar
    $(window).on('resize', function() {
        var win = $(this);
        if (win.width() < 1250) {
          $('#searchBar').removeClass('col-6');
          $('#searchBar').addClass('col-10');
        }
      });

});

function generateSearchResultsUsers(results){
    let searchData = results["data"];
    let list = searchData['personnel'];

    var search_html_table = "";

    // Update Main HTML Table
    for(i=0; i < list.length; i++){
        
        search_html_table += `<tr class="tableRow" id="${list[i].id}"><td scope="row" class="tableIcon"><i class="fas fa-user-circle fa-lg"></i></td><td scope="row">${list[i].firstName}</td><td scope="row">${list[i].lastName}</td><td scope="row" class="hider1">${list[i].email}</td><td scope="row" class="hider1">${list[i].jobTitle}</td><td scope="row" class="hider2">${list[i].department}</td><td scope="row" class="hider2">${list[i].location}</td></tr>`;
        
    }
    
    //$('#mainTable').html(`${search_html_table}`);
    $('#sqlTable').find('tbody').html(`${search_html_table}`);

}

function getLocations(){
    $.ajax({
        type: 'GET',
        url: "../companydirectory/libs/php/getLocations.php",
        data: {},
        dataType: 'json',
        async: false,
        success: function(results) {

            currentLocations = [];
            let data = results["data"];

            for(let i=0; i < data.length; i++){
                currentLocations.push(data[i]);
            }

        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })   
}

function getDepartmentsByUser(){
    $.ajax({
        type: 'GET',
        url: "../companydirectory/libs/php/getDepartmentsByUser.php",
        data: {},
        dataType: 'json',
        async: false,
        success: function(results) {

            currentDepartments = [];
            let data = results["data"];

            for(let i=0; i < data.length; i++){
                currentDepartments.push(data[i]);
            }

        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })   
}

function generateDepartmentList(){
    // Generate the html table with department list 
    $.ajax({
        type: 'GET',
        url: "../companydirectory/libs/php/getDepartmentsByUser.php",
        data: {},
        dataType: 'json',
        async: false,
        success: function(results) {

            let data = results["data"];
            let depArray = [];
            let dep_html = ``;

            for(let i=0; i < data.length; i++){
                depArray.push(data[i]);
            }

            for(let i=0; i < depArray.length; i++){
                // dep_html += `<tr id="${depArray[i].id}" class=" departmentEdit depTableRow" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#departmentEditModal" title="${depArray[i].department}" location="${depArray[i].locationID}" users="${depArray[i].users}" departmentID="${depArray[i].id}"><td class="tableIcon"><i class="fas fa-building"></i></td><td scope="row" class="department"> ${depArray[i].department} </td><td scope="row" class="department_location"> ${depArray[i].location} </td>`;
                dep_html += `<tr>
                <td class="align-middle text-nowrap departmentName">
                ${depArray[i].department}
                </td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">
                ${depArray[i].location}
                </td>
                <td class="align-middle text-end text-nowrap">
                  <button type="button" class="btn btn-info btn-sm" data-bs-toggle="modal" data-bs-target="#editDepartmentModal" data-id="${depArray[i].id}">
                    <i class="fa-solid fa-pencil fa-fw"></i>
                  </button>
                  <button type="button" class="btn btn-info btn-sm btn-delete" data-id="${depArray[i].id}">
                    <i class="fa-solid fa-trash fa-fw"></i>
                  </button>
                </td>
              </tr> `;
            
            
            }

            $('#departmentTable').html(dep_html);

        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })     
}

function getAllUsers(){
    
    // Generate all user data for the table        
    $.ajax({
        type: 'GET',
        url: "../companydirectory/libs/php/getAll.php",
        data: {},
        dataType: 'json',
        async: false,
        success: function(results) {

            
            // Update Main HTML Table  
            let data = results["data"];              
            let usersArray = [];
            let html_table = '';
            
            for(let i=0; i < data.length; i++){
                usersArray.push(data[i]);
            }

            for(let i=0; i < usersArray.length; i++){
               // html_table += `<tr class="tableRow" id="${usersArray[i].id}"><td scope="row" class="tableIcon"><i class="fas fa-user-circle fa-lg"></i></td><td scope="row">${usersArray[i].firstName}</td><td scope="row">${usersArray[i].lastName}</td><td scope="row" class="hider1">${usersArray[i].email}</td><td scope="row" class="hider1">${usersArray[i].jobTitle}</td><td scope="row" class="hider2">${usersArray[i].department}</td><td scope="row" class="hider2">${usersArray[i].location}</td></tr>`;

                html_table += `<tr>
                <td class="align-middle text-nowrap userName">
                ${usersArray[i].firstName}, ${usersArray[i].lastName}
                </td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">
                ${usersArray[i].department}
                </td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">
                ${usersArray[i].location}
                </td>
                <td class="align-middle text-nowrap d-none d-md-table-cell">
                ${usersArray[i].email}
                </td>
                <td class="text-end text-nowrap">
                <button type="button" class="btn btn-info btn-sm" data-bs-toggle="modal" data-bs-target="#viewPersonnelModal" data-id="${usersArray[i].id}">
                    <i class="fa-solid fa-eye fa-fw"></i>
                  </button>
                  <button type="button" class="btn btn-info btn-sm" data-bs-toggle="modal" data-bs-target="#editPersonnelModal" data-id="${usersArray[i].id}">
                    <i class="fa-solid fa-pencil fa-fw"></i>
                  </button>
                  <button type="button" class="btn btn-info btn-sm btn-delete" data-id="${usersArray[i].id}">
                    <i class="fa-solid fa-trash fa-fw"></i>
                  </button>
                </td>
              </tr>`;

            };
            
            $('#mainTable').empty().append(html_table); 

        },
        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })

};

let day = new Date().toUTCString().slice(0, 16);

// function setTime() {
//   let d = new Date(),
//     todayDate = document.querySelector("#todayDate");

//   todayDate.innerHTML = `${day}, ${formatAMPM(d)}`;

//   setTimeout(setTime, 1000);
// }

function formatAMPM(date) {
  let hours = date.getHours(),
    minutes = date.getMinutes(),
    seconds = date.getSeconds(),
    ampm = hours >= 12 ? "pm" : "am";

  if (seconds < 10) {
    seconds = `0${seconds}`;
  }
  hours = hours % 12;
  hours = hours ? hours : 12;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  let strTime = hours + ":" + minutes + ":" + seconds + " " + ampm;
  return strTime;
}



// $(function() {
//     setTime();
//     });

function openNav() {
    document.getElementById("mySidenav").style.width = "100px";
    }
      
function closeNav() {
    document.getElementById("mySidenav").style.width = "0";
    }    

$("#mySidenav").hover(function() {
        
      }, function() {
        closeNav();
      })

function ViewLocationTable()
{
    $.ajax({
        type: 'GET',
        url: "../companydirectory/libs/php/getLocations.php",
        data: {},
        dataType: 'json',
        async: false,
        success: function(results) {
            let data = results["data"];
            let locArray = [];
            let loc_html = ``;

            for(let i=0; i < data.length; i++){
                locArray.push(data[i]);
            }

            for(let i=0; i < locArray.length; i++){
                loc_html += `<tr><td class="align-middle text-nowrap locationName"> ${locArray[i].location}</td><td class="align-middle text-end text-nowrap">
                <button type="button" class="btn btn-info btn-sm" data-bs-toggle="modal" data-bs-target="#editLocationModal" data-id="${locArray[i].id}"><i class="fa-solid fa-pencil fa-fw"></i>
                </button >
                <button type="button" class="btn btn-info btn-sm btn-delete" data-id="${locArray[i].id}">
                  <i class="fa-solid fa-trash fa-fw"></i>
                </button>
              </td>
            </tr>`;

            }

            $('#locationTable').html(loc_html);
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
}

//================================================================================================================================================================================
//==================================================================================================================================================

$("#addBtn").click(function(){
    var activeTab= $('.tab-content .active').attr('id').split('-'); 
    
    switch (activeTab[0]){
        case 'personnel' :$('#addPersonnelModal').modal('show')
            break;
        case 'departments' :$('#addDepartmentModal').modal('show')
            break;
        case 'locations' :$('#addLocationModal').modal('show')
            break;
    }
 });

$('#locationsBtn').click(function(){
    ViewLocationTable();
});

$("#editLocationModal").on("show.bs.modal", function (e) {
    
    $.ajax({
      url:"../companydirectory/libs/php/getLocationByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $(e.relatedTarget).attr("data-id") // Retrieves the data-id attribute from the calling button
      },
      success: function (result) {
        var resultCode = result.status.code;
  
        if (resultCode == 200) {
          $("#editLocationID").val(result.data.location[0].locationId);  
          $("#editLocationName").val(result.data.location[0].locationName);         
        } else {
          $("#editLocationModal .modal-title").replaceWith(
            "Error retrieving data"
          );
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#editLocationModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    });
  });

  $("#editLocationModal").on("submit", function (e) {
    // stop the default browser behviour
  
    e.preventDefault();
  
    $.ajax({
        type: 'POST',
        url: "../companydirectory/libs/php/updateLocation.php",
        data: {
            name: $('#editLocationName').val(),
            locationID: $('#editLocationID').val(),
        },
        dataType: 'json',
        async: false,
        success: function(results) {

            ViewLocationTable();
            $("#editLocationModal .btn-close").click();
        },

        error: function(jqXHR, textStatus, errorThrown) {
            $("#editLocationModal .modal-title").replaceWith(
                "Error retrieving data"
              );
        }
    })
  });

  $("#addLocationModal").on("submit", function (e) {  
    e.preventDefault();
    $.ajax({
        type: 'POST',
        url: "../companydirectory/libs/php/insertLocation.php",
        data: {
            name: $('#addLocationName').val(),
        },
        dataType: 'json',
        async: false,
        success: function(results) {

            ViewLocationTable();
            $('#addLocationModal form')[0].reset();
            $("#addLocationModal .btn-close").click();
            
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $("#editLocationModal .modal-title").replaceWith(
                "Error retrieving data"
              );
        }
    })
  });

  

$('#locationTable').on('click', 'button.btn-delete', function(e) {

var id= $(e.currentTarget).attr("data-id");
var name = $(this).closest('tr').find('.locationName').text();
$.ajax({
    type: 'POST',
    url: "../companydirectory/libs/php/checkDepartmentInLocation.php",
    
    data: {
        locationID: id,
    },
    dataType: 'json',
    async: false,
    success: function(results) {
        console.log(results);
        if (results.data[0].locationCount == 0) {  
            $("#deleteLocationText").html("You are about to delete location: <b>"+name.trim()+"</b>");
            $("#deleteLocationID").val(id);        
            $("#deleteLocationModal").modal("show"); 
        }
        else{
            $("#cantDeleteLocationName").text(results.data[0].locationName);
            $("#pc").text(results.data[0].locationCount);
            $("#cantDeleteLocationModal").modal("show");
        }
    },

    error: function(jqXHR, textStatus, errorThrown) {
        console.log(errorThrown);
    }
}) 
});

$("#deleteLocationModal").on("submit", function (e) {
    
    var id=$("#deleteLocationID").val();
    e.preventDefault();
    $.ajax({
        type: 'POST',
        url: "../companydirectory/libs/php/deleteLocationByID.php",    
        data: {
            locationID: id,
        },
        dataType: 'json',
        async: false,
        success: function(results) {
            ViewLocationTable();
            $("#deleteLocationModal .btn-close").click();
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    }) 
    });
  

// Departments

$('#departmentsBtn').click(function(){
    generateDepartmentList();
});

$("#editDepartmentModal").on("show.bs.modal", function (e) {
    $.ajax({
      url:"../companydirectory/libs/php/getDepartmentById.php",
      type: "POST",
      dataType: "json",
      data: {
        id:$(e.relatedTarget).attr("data-id")
      },
      success: function (result) {
        var resultCode = result.status.code;
  
        if (resultCode == 200) {
          // Update the hidden input with the employee id so that
          // it can be referenced when the form is submitted
  
          $("#editDepartmentID").val(result.data.department[0].departmentId);
          $("#editDepartmentName").val(result.data.department[0].departmentName);
        
          getLocations();
            let locationSelection = "";
            for(i=0; i<currentLocations.length; i++){
                
                if(currentLocations[i].id == result.data.department[0].locationId){
                    locationSelection += `<option value="${currentLocations[i].id}" selected="selected">${currentLocations[i].location}</option>`
                }
                else {
                    locationSelection += `<option value="${currentLocations[i].id}">${currentLocations[i].location}</option>`
                }
            }

            $('#editLocation').html(locationSelection);
          
        } else {
          $("#editDepartmentModal .modal-title").replaceWith(
            "Error retrieving data"
          );
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#editDepartmentModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    });
  });

  $("#editDepartmentModal").on("submit", function (e) {
    e.preventDefault();
  
    $.ajax({
        type: 'POST',
        url: "../companydirectory/libs/php/updateDepartment.php",
        data: {
            name: $('#editDepartmentName').val(),
            locationID: $('#editLocation').find(":selected").val(),
            departmentID: $("#editDepartmentID").val()
        },
        dataType: 'json',
        async: false,
        success: function(results) {

            generateDepartmentList();
            $("#editDepartmentModal .btn-close").click();
        },
        error: function(jqXHR, textStatus, errorThrown) {
            $("#editDepartmentModal .modal-title").replaceWith(
                "Error retrieving data"
              );
        }
    })
  });

  $("#addDepartmentModal").on("submit", function (e) {  
    e.preventDefault();
    $.ajax({
        type: 'POST',
        url: "../companydirectory/libs/php/insertDepartment.php",
        data: {
            name: $('#addDepartmentName').val(),
            locationID:$('#addLocation').find(":selected").val()
        },
        dataType: 'json',
        async: false,
        success: function(results) {

            generateDepartmentList();
            $('#addDepartmentModal form')[0].reset();
            $("#addDepartmentModal .btn-close").click();
        },

        error: function(jqXHR, textStatus, errorThrown) {
            $("#addDepartmentModal .modal-title").replaceWith(
                "Error retrieving data"
              );
        }
    })
  });


  $("#addDepartmentModal").on("show.bs.modal", function (e) {
    getLocations();
            let locationSelection = "";
            for(i=0; i<currentLocations.length; i++){
                    locationSelection += `<option value="${currentLocations[i].id}">${currentLocations[i].location}</option>`
            }
            $('#addLocation').html(locationSelection);
  });


  $('#departmentTable').on('click', 'button.btn-delete', function(e) {

    var id= $(e.currentTarget).attr("data-id");
    var name = $(this).closest('tr').find('.departmentName').text();
    $.ajax({
        type: 'POST',
        url: "../companydirectory/libs/php/checkPersonelInDepartment.php",
        
        data: {
            departmentID: id
        },
        dataType: 'json',
        async: false,
        success: function(results) {
            console.log(results);
            if (results.data[0].departmentCount == 0) {  
                $("#deleteDepartmentText").html("You are about to delete department: <b>"+name.trim()+"</b>");
                $("#deleteDepartmentID").val(id);        
                $("#deleteDepartmentModal").modal("show"); 
            }
            else{
                $("#cantDeleteDeptName").text(results.data[0].departmentName);
                $("#empCount").text(results.data[0].departmentCount);
                $("#cantDeleteDepartmentModal").modal("show");
            }
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
});

$("#deleteDepartmentModal").on("submit", function (e) {
    
    var id=$("#deleteDepartmentID").val();
    e.preventDefault();
    $.ajax({
        type: 'POST',
        url: "../companydirectory/libs/php/deleteDepartmentByID.php",
        data: {
            id: id,
        },
        dataType: 'json',
        async: false,
        success: function(results) {
            generateDepartmentList();
            $("#deleteDepartmentModal .btn-close").click();
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
    })
    });

    //Personnals
$('#personnelBtn').click(function(){
    getAllUsers();
});

$("#editPersonnelModal").on("show.bs.modal", function (e) {
    $.ajax({
      url: "../companydirectory/libs/php/getPersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $(e.relatedTarget).attr("data-id")
      },
      success: function (result) {
        var resultCode = result.status.code;
        if (resultCode == 200) {
 
          $("#editPersonnelEmployeeID").val(result.data.personnel[0].id);

          $("#editPersonnelFirstName").val(result.data.personnel[0].firstName);
          $("#editPersonnelLastName").val(result.data.personnel[0].lastName);
          $("#editPersonnelJobTitle").val(result.data.personnel[0].jobTitle);
          $("#editPersonnelEmailAddress").val(result.data.personnel[0].email);
        
          getDepartmentsByUser();

        let departmentSelection = "";
        for(i=0; i<currentDepartments.length; i++){
            if(currentDepartments[i].department == result.data.personnel[0].department){
                departmentSelection += `<option value="${currentDepartments[i].id}" selected="selected">${currentDepartments[i].department}</option>`
            } else {
                departmentSelection += `<option value="${currentDepartments[i].id}">${currentDepartments[i].department}</option>`
            }                
        }
            $('#editPersonnelDepartment').html(departmentSelection);
          
        } else {
          $("#editDepartmentModal .modal-title").replaceWith(
            "Error retrieving data"
          );
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#editDepartmentModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    });
  });

$("#editPersonnelModal").on("submit", function (e) {
    e.preventDefault();
  
    $.ajax({
        type: 'POST',
        url: "../companydirectory/libs/php/updateUser.php",
        data: {
            firstName: $('#editPersonnelFirstName').val(),
            lastName: $('#editPersonnelLastName').val(),
            email: $('#editPersonnelEmailAddress').val(),
            jobTitle: $('#editPersonnelJobTitle').val(),
            departmentID: $('#editPersonnelDepartment').find(":selected").val(),
            id: $("#editPersonnelEmployeeID").val()
        },
        dataType: 'json',
        async: false,
        success: function(results) {
           
            getAllUsers();
            $("#editPersonnelModal .btn-close").click();

        },

        error: function(jqXHR, textStatus, errorThrown) {
            $("#editPersonnelModal .modal-title").replaceWith(
                "Error retrieving data"
              );
        }
    }) 
    
});

$("#addPersonnelModal").on("show.bs.modal", function (e) {
    getDepartmentsByUser();

        let departmentSelection = "";
        for(i=0; i<currentDepartments.length; i++){
                departmentSelection += `<option value="${currentDepartments[i].id}">${currentDepartments[i].department}</option>`
            }                      
            $('#addPersonnelDepartment').html(departmentSelection);
  });

  $("#addPersonnelModal").on("submit", function (e) {  
    e.preventDefault();
    $.ajax({
        type: 'POST',
        url: "../companydirectory/libs/php/insertUser.php",
        data: {
                firstName: $('#addPersonnelFirstName').val(),
                lastName: $('#addPersonnelLastName').val(),
                email: $('#addPersonnelEmailAddress').val(),
                jobTitle: $('#addPersonnelJobTitle').val(),
                departmentID: $('#addPersonnelDepartment').find(":selected").val()
            },
        dataType: 'json',
        async: false,
        success: function(results) {

            getAllUsers();
            $('#addPersonnelModal form')[0].reset();
            $("#addPersonnelModal .btn-close").click();
        },

        error: function(jqXHR, textStatus, errorThrown) {
            $("#addPersonnelModal .modal-title").replaceWith(
                "Error retrieving data"
              );
        }
    })
  });

$('#personnelTable').on('click', 'button.btn-delete', function(e) {

    var id= $(e.currentTarget).attr("data-id");
    var name = $(this).closest('tr').find('.userName').text();
    $("#deletePersonnelText").html("You are about to delete personnel: <b>"+name.trim()+"</b>");
    $("#deletePersonnelID").val(id);        
    $("#deletePersonnelModal").modal("show"); 
});

  $("#deletePersonnelModal").on("submit", function (e) {
    
    var id=$("#deletePersonnelID").val();
    e.preventDefault();
    $.ajax({
        type: 'POST',
        url: "./libs/php/deleteUserByID.php",
        data: {
            id: id,
        },
        dataType: 'json',
        async: false,
        success: function(results) {
        getAllUsers();   
        $("#deletePersonnelModal .btn-close").click();
        },

        error: function(jqXHR, textStatus, errorThrown) {
            console.log(errorThrown);
        }
        
    }) 
});

$("#viewPersonnelModal").on("show.bs.modal", function (e) {
    $.ajax({
      url: "../companydirectory/libs/php/getPersonnelByID.php",
      type: "POST",
      dataType: "json",
      data: {
        id: $(e.relatedTarget).attr("data-id")
      },
      success: function (result) {
        var resultCode = result.status.code;
        if (resultCode == 200) {
 

        //   $("#cardTitle").html(result.data.personnel[0].firstName +" "+ result.data.personnel[0].lastName);
        //   $("#cardJob").html(result.data.personnel[0].jobTitle);
        //   $("#cardDept").html(result.data.personnel[0].department);
        //   $("#cardLocation").html(result.data.personnel[0].location);
        //   $("#cardEmail").html(result.data.personnel[0].email);
        //   $('#cardEmail').html('href', `mailto:${result.data.personnel[0].email}`);
        var html_modal=`<div class="modal-header bg-info">
        <h5 class="modal-title" id="cardTitle">${result.data.personnel[0].firstName +" "+ result.data.personnel[0].lastName}</h5>
        <button type="button" class="btn-close btn-close-black" data-bs-dismiss="modal" aria-label="Close"></button>
    </div>
    <div class="modal-body">
        <img src="libs/imgs/avatar.png" class="card-img-top" alt="" style="display: block; height: 100px; width: 100px; border-radius: 100px; margin: 10px auto; margin-bottom: 0px;">
        <h5 class="card-title text-center mt-3" id="cardJob">${result.data.personnel[0].jobTitle}</h5>
        <p class="card-text text-center" id="cardDept">
${result.data.personnel[0].department} | <span class="badge badge-danger" id="cardLocation">${result.data.personnel[0].location}</span><br>
<a href="mailto:${result.data.personnel[0].email}" class="btn btn-info mt-3" id="cardEmail"><i class="fas fa-envelope"></i> ${result.data.personnel[0].email}</a></p>
    </div>`

    $("#viewModalDiv").html(html_modal);
        }
      },
      error: function (jqXHR, textStatus, errorThrown) {
        $("#editDepartmentModal .modal-title").replaceWith(
          "Error retrieving data"
        );
      }
    });
  });

  $("#searchBar").on("keyup", function() {

    if ($("#personnelBtn").hasClass("active")) {
        var value = $(this).val().toLowerCase();
        $("#mainTable tr").filter(function() {
        $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
        });
      } else {
        if ($("#departmentsBtn").hasClass("active")) {
            var value = $(this).val().toLowerCase();
            $("#departmentTable tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
        } else {
            var value = $(this).val().toLowerCase();
            $("#locationTable tr").filter(function() {
            $(this).toggle($(this).text().toLowerCase().indexOf(value) > -1)
            });
        }
  }});

$("#refreshBtn").click(function(){
    if ($("#personnelBtn").hasClass("active")) {
        getAllUsers();
      } else {
        if ($("#departmentsBtn").hasClass("active")) {
            generateDepartmentList();
        } else {
            ViewLocationTable();
        }
    
      }
 });

 