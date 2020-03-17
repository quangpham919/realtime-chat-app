import React, { useState } from 'react';
import { makeStyles, withStyles } from '@material-ui/core/styles';
import {IconButton} from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import SaveIcon from '@material-ui/icons/Save';
import Table from '@material-ui/core/Table';
import TableContainer from '@material-ui/core/TableContainer';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import TablePagination from '@material-ui/core/TablePagination';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';


const StyledTableCell = withStyles(theme => ({
  head: {
    backgroundColor: theme.palette.common.black,
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

const StyledTableRow = withStyles(theme => ({
  root: {
    '&:nth-of-type(odd)': {
      backgroundColor: theme.palette.background.default,
    },
  },
}))(TableRow);


const useStyles = makeStyles(theme => ({
    marginTop: {
      "marginTop":"100px"
    },
    appBarSpacer: theme.mixins.toolbar,
    head: {
      backgroundColor: theme.palette.text.primary,
      color: theme.palette.common.white,
    },

    table: {
      minWidth: 700,
      marginTop: '100px'
    },
  }));


const TablePaginationActions = (props)=>{
  const { count, page, rowsPerPage, onChangePage } = props;

  const handleBackButtonClick = event => {
    onChangePage(event, page - 1);
  };

  const handleNextButtonClick = event => {
    onChangePage(event, page + 1);
  };

  return(
    <> 
    <IconButton onClick={event => handleBackButtonClick(event)} disabled={page === 0} aria-label="previous page">
      { <KeyboardArrowLeft />}
    </IconButton>
    <IconButton
    onClick={ event => handleNextButtonClick(event)}
    disabled={page >= Math.ceil(count/rowsPerPage) - 1 }
    aria-label="next page">
     {<KeyboardArrowRight />}
    </IconButton>
    </>
  )
}
  
export const CustomTable= (props)  => {
    const [rowsPerPage, setRowsPerPage] = useState(5);
    const [page, setPage] = useState(0)
    const { objectArray } = props
    const classes = useStyles();


    const handleChangePage = (event, newPage) => {
      setPage(newPage);
    };

    const handleChangeRowsPerPage = event => {
      setRowsPerPage(parseInt(event.target.value, 10));
      setPage(0);
    };
    


    const renderTableData  = () => {
      return objectArray.map((obj, index) => {
        let col = Object.keys(obj)
        return (
           <StyledTableRow key={obj._id}>
              {col.map((val, index) => {
                 return <TableCell key={index}>
                        { obj[col[index]]}
                        </TableCell>
              })}
            <StyledTableCell key="Action">
                <IconButton aria-label="edit"> <SaveIcon /> </IconButton>
                <IconButton aria-label="delete"> <DeleteIcon /> </IconButton>
            </StyledTableCell>
           </StyledTableRow>
        )
      })
    }

    const renderTableHeader = ()  => {
      let header = Object.keys(objectArray[0])
      return header.map((key, index) => {
         return <StyledTableCell key={index}>{key.toUpperCase()} </StyledTableCell>
         
         
      })
   }


    return (
      <React.Fragment>
        <div  />
        <TableContainer>
        <Table className={classes.table} size="small">
          <TableHead className={classes.head}>
          <TableRow>
          {renderTableHeader()}
          <StyledTableCell key="Action">Action </StyledTableCell>
          </TableRow>
          </TableHead>
          <TableBody>
              {renderTableData()}
              
          </TableBody>
        </Table>

        <TablePagination
          rowsPerPageOptions={[1,5, 10, 25]}
          colSpan={3}
          count={objectArray.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onChangePage={handleChangePage}
          onChangeRowsPerPage={handleChangeRowsPerPage}
          ActionsComponent={TablePaginationActions}
        />
        </TableContainer>
      </React.Fragment>
    );
  } 